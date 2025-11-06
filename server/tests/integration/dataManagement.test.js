const { gql } = require('apollo-server');
const dbCleaner = require('../util/db-cleaner');
const {
  query,
  mutate,
  getDefaultUser,
  setCustomUser
} = require('../util/graphql-test-utilities');
const db = require('../../models');
const { rawQuery } = require('../../models/services/ModelService');

jest.setTimeout(20000);

afterAll(async () => {
  // Closing the DB connection allows Jest to exit successfully.
  await db.sequelize.close();
}, 20000);

const atsQuery = ({ transaction }) => {
  return query(
    gql`
      query {
        ats {
          id
          atVersions {
            id
          }
        }
      }
    `,
    { transaction }
  );
};

const testPlanVersionsQuery = ({
  transaction,
  directory = `""`,
  phases = `[RD, DRAFT, CANDIDATE]`
}) => {
  return query(
    gql`
      query {
        testPlanVersions(
          directory: ${directory}
          phases: ${phases}
        ) {
          id
          phase
          gitSha
          metadata
          testPlan {
            directory
          }
          testPlanReports {
            id
            markedFinalAt
            at {
              id
              vendorId
            }
            browser {
              id
            }
            draftTestPlanRuns {
              id
              testResults {
                id
                completedAt
                test {
                  id
                  rowNumber
                  title
                  ats {
                    id
                    name
                  }
                  scenarios {
                    id
                    commands {
                      id
                      text
                    }
                  }
                  assertions {
                    id
                    priority
                    text
                  }
                }
                scenarioResults {
                  output
                  assertionResults {
                    id
                    assertion {
                      text
                    }
                    passed
                  }
                  scenario {
                    id
                    commands {
                      id
                      text
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    { transaction }
  );
};

const updateVersionToPhaseQuery = (
  testPlanVersionId,
  phase,
  { testPlanVersionDataToIncludeId, transaction } = {}
) => {
  return mutate(
    gql`
      mutation {
        testPlanVersion(id: ${testPlanVersionId}) {
          updatePhase(
            phase: ${phase}
            testPlanVersionDataToIncludeId: ${
              testPlanVersionDataToIncludeId ?? null
            }
          ) {
            testPlanVersion {
              id
              phase
              gitSha
              metadata
              testPlan {
                directory
              }
              testPlanReports {
                id
                markedFinalAt
                at {
                  id
                }
                minimumAtVersion {
                  id
                }
                exactAtVersion {
                  id
                }
                browser {
                  id
                }
                draftTestPlanRuns {
                  id
                  initiatedByAutomation
                  testResults {
                    id
                    completedAt
                    test {
                      id
                      rowNumber
                      title
                      ats {
                        id
                        name
                      }
                      scenarios {
                        id
                        commands {
                          id
                          text
                        }
                      }
                      assertions {
                        id
                        priority
                        text
                      }
                    }
                    scenarioResults {
                      output
                      assertionResults {
                        id
                        assertion {
                          text
                        }
                        passed
                      }
                      scenario {
                        id
                        commands {
                          id
                          text
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    { transaction }
  );
};

const createTestPlanReportQuery = (
  testPlanVersionId,
  atId,
  minimumAtVersionId,
  browserId,
  { transaction }
) => {
  return mutate(
    gql`
      mutation {
        createTestPlanReport(input: {
          testPlanVersionId: ${testPlanVersionId}
          atId: ${atId}
          minimumAtVersionId: ${minimumAtVersionId}
          browserId: ${browserId}
        }) {
          testPlanReport {
            id
            at {
              id
            }
            browser {
              id
            }
          }
          testPlanVersion {
            id
            phase
            testPlanReports {
              id
            }
          }
        }
      }
    `,
    { transaction }
  );
};

const markAsFinal = (testPlanReportId, { transaction }) => {
  return mutate(
    gql`
      mutation {
        testPlanReport(id: ${testPlanReportId}) {
          markAsFinal {
            testPlanReport {
              id
              markedFinalAt
            }
          }
        }
      }
    `,
    { transaction }
  );
};

const updateVendorReviewStatus = (
  testPlanReportId,
  reviewStatus,
  { transaction }
) => {
  return mutate(
    gql`
      mutation {
        testPlanReport(id: ${testPlanReportId}) {
          promoteVendorReviewStatus {
            testPlanReport {
              id
              vendorReviewStatus
            }
          }
        }
      }
    `,
    { transaction }
  );
};

const submitTestResult = (testResultId, testResult, { transaction }) => {
  return mutate(
    gql`
      mutation SubmitTestResult($input: TestResultInput!) {
        testResult(id: "${testResultId}") {
          submitTestResult(input: $input) {
            locationOfData
          }
        }
      }
    `,
    { variables: { input: testResult }, transaction }
  );
};

const addViewer = (testId, testPlanReportId, { transaction }) => {
  return mutate(
    gql`
      mutation {
        addViewer(testId: "${testId}", testPlanReportId: ${testPlanReportId}) {
          username
        }
      }
    `,
    { transaction }
  );
};

const countCompletedTests = testPlanReports => {
  return testPlanReports.reduce((acc, testPlanReport) => {
    return (
      acc +
        testPlanReport.draftTestPlanRuns[0]?.testResults.reduce(
          (acc, testResult) => (testResult.completedAt ? acc + 1 : acc),
          0
        ) || 0
    );
  }, 0);
};

const getTestableTestPlanVersions = async ({
  directory = '',
  oldVersionSha,
  newVersionSha,
  expectedOldVersionPhase = 'DRAFT',
  expectedNewVersionPhase = 'RD',
  useV2Format = false,
  transaction
}) => {
  const testPlanVersions = await testPlanVersionsQuery({
    transaction,
    directory: `"${directory}"`,
    phases: `[DEPRECATED, RD, DRAFT, CANDIDATE]`
  });

  const oldTestPlanVersion = testPlanVersions.testPlanVersions.find(
    e =>
      e.phase === expectedOldVersionPhase &&
      e.gitSha === oldVersionSha &&
      (useV2Format ? e.metadata.testFormatVersion === 2 : true)
  );

  // Process new version coming in as RD
  let newTestPlanVersion = testPlanVersions.testPlanVersions.find(
    e =>
      e.phase === expectedNewVersionPhase &&
      e.testPlan.directory === directory &&
      (useV2Format ? e.metadata.testFormatVersion === 2 : true)
  );

  if (newTestPlanVersion) {
    if (newTestPlanVersion.gitSha === newVersionSha)
      return [oldTestPlanVersion, newTestPlanVersion];

    // To prevent any oddities when using the intended version to be in RD,
    // remove any newer version that deprecated it
    await rawQuery(
      `
        delete
        from "TestPlanReport"
        where "testPlanVersionId" = ${newTestPlanVersion.id};
        delete
        from "TestPlanVersion"
        where id = ${newTestPlanVersion.id};`,
      { transaction }
    );

    newTestPlanVersion = testPlanVersions.testPlanVersions.find(
      e =>
        e.gitSha === newVersionSha &&
        e.testPlan.directory === directory &&
        (useV2Format ? e.metadata.testFormatVersion === 2 : true)
    );

    const {
      testPlanVersion: {
        updatePhase: { testPlanVersion: updatedTestPlanVersion }
      }
    } = await updateVersionToPhaseQuery(
      newTestPlanVersion.id,
      expectedNewVersionPhase,
      {
        transaction
      }
    );

    newTestPlanVersion = updatedTestPlanVersion;
  }

  return [oldTestPlanVersion, newTestPlanVersion];
};

const getTestableModalDialogVersions = async transaction => {
  // https://github.com/w3c/aria-at/compare/5fe7afd82fe51c185b8661276105190a59d47322..d0e16b42179de6f6c070da2310e99de837c71215
  // Modal Dialog was updated to show have differences between several NVDA and JAWS tests
  // There are no changes for the VO tests
  const directory = 'apg/modal-dialog';
  const expectedOldVersionPhase = 'CANDIDATE';
  const expectedNewVersionPhase = 'DRAFT';
  const oldVersionSha = '5fe7afd82fe51c185b8661276105190a59d47322';
  const newVersionSha = 'd0e16b42179de6f6c070da2310e99de837c71215';

  return getTestableTestPlanVersions({
    directory,
    expectedOldVersionPhase,
    expectedNewVersionPhase,
    oldVersionSha,
    newVersionSha,
    transaction
  });
};

const getTestableCommandButtonVersions = async transaction => {
  // The difference between them is that there have been updated settings for VoiceOver tests;
  // 2 were switched from 'quickNavOn' to 'singleQuickKeyNavOn'
  //
  // Based on https://github.com/w3c/aria-at/compare/d9a19f8...565a87b#diff-4e3dcd0a202f268ebec2316344f136c3a83d6e03b3f726775cb46c57322ff3a0,
  // only 'navForwardsToButton' and 'navBackToButton' tests were affected. The individual tests for
  // 'reqInfoAboutButton' should still match.
  const directory = 'apg/command-button';
  const expectedOldVersionPhase = 'DRAFT';
  const oldVersionSha = 'd9a19f815d0f21194023b1c5919eb3b04d5c1ab7';
  const newVersionSha = '565a87b4111acebdb883d187b581e82c42a73844';
  const useV2Format = true;

  return getTestableTestPlanVersions({
    directory,
    expectedOldVersionPhase,
    oldVersionSha,
    newVersionSha,
    useV2Format,
    transaction
  });
};

describe('data management', () => {
  it('can set test plan version to candidate and recommended', async () => {
    await dbCleaner(async transaction => {
      const candidateTestPlanVersions = await query(
        gql`
          query {
            testPlanVersions(phases: [CANDIDATE]) {
              id
              phase
            }
          }
        `,
        { transaction }
      );
      const candidateTestPlanVersion =
        candidateTestPlanVersions.testPlanVersions[0];

      // This version is in 'CANDIDATE' phase. Set it to DRAFT
      // This will also remove the associated TestPlanReports markedFinalAt values
      const testPlanVersionId = candidateTestPlanVersion.id;
      await updateVersionToPhaseQuery(testPlanVersionId, 'DRAFT', {
        transaction
      });

      const previous = await query(
        gql`
          query {
            testPlanVersion(id: ${testPlanVersionId}) {
              phase
              testPlanReports {
                id
              }
            }
          }
        `,
        { transaction }
      );
      const previousPhase = previous.testPlanVersion.phase;
      const previousPhaseTestPlanReportId =
        previous.testPlanVersion.testPlanReports[0].id;

      // Need to approve at least one of the associated reports
      await markAsFinal(previousPhaseTestPlanReportId, { transaction });

      // Check to see that the testPlanVersion cannot be updated until the reports have been
      // finalized
      await expect(() => {
        return updateVersionToPhaseQuery(testPlanVersionId, 'CANDIDATE', {
          transaction
        });
      }).rejects.toThrow(
        /Cannot set phase to candidate because the following required reports have not been collected or finalized:/i
      );

      const testPlanReportsToMarkAsFinalResult = await query(
        gql`
          query {
            testPlanReports(testPlanVersionId: ${testPlanVersionId}) {
              id
            }
          }
        `,
        { transaction }
      );

      for (const testPlanReport of testPlanReportsToMarkAsFinalResult.testPlanReports) {
        await markAsFinal(testPlanReport.id, { transaction });
      }

      const candidateResult = await updateVersionToPhaseQuery(
        testPlanVersionId,
        'CANDIDATE',
        { transaction }
      );
      const candidateResultPhase =
        candidateResult.testPlanVersion.updatePhase.testPlanVersion.phase;

      const recommendedResult = await updateVersionToPhaseQuery(
        testPlanVersionId,
        'RECOMMENDED',
        { transaction }
      );
      const recommendedResultPhase =
        recommendedResult.testPlanVersion.updatePhase.testPlanVersion.phase;

      expect(candidateTestPlanVersion.phase).toBe('CANDIDATE');
      expect(previousPhase).not.toBe('CANDIDATE');
      expect(candidateResultPhase).toBe('CANDIDATE');
      expect(recommendedResultPhase).toBe('RECOMMENDED');
    });
  });

  it('updates test plan version and copies results from previous version reports even in advanced phase', async () => {
    await dbCleaner(async transaction => {
      // oldModalDialogVersion has reports for JAWS + Chrome,
      // NVDA + Chrome, VO + Safari + additional non-required
      // reports in CANDIDATE
      //
      // Process newModalDialogVersion will be coming in as RD
      const [oldModalDialogVersion, newModalDialogVersion] =
        await getTestableModalDialogVersions(transaction);

      const oldModalDialogVersionTestPlanReports =
        oldModalDialogVersion.testPlanReports;
      const oldModalDialogVersionTestPlanReportsCount =
        oldModalDialogVersionTestPlanReports.length;

      // Get JAWS-specific tests count for old version
      const oldModalDialogVersionJAWSCompletedTestsCount = countCompletedTests(
        oldModalDialogVersionTestPlanReports.filter(el => el.at.id == 1)
      );

      // Get NVDA-specific tests count for old version
      const oldModalDialogVersionNVDACompletedTestsCount = countCompletedTests(
        oldModalDialogVersionTestPlanReports.filter(el => el.at.id == 2)
      );

      // Get VO-specific tests count for old version
      const oldModalDialogVersionVOCompletedTestsCount = countCompletedTests(
        oldModalDialogVersionTestPlanReports.filter(el => el.at.id == 3)
      );

      // Process new version coming in as RD
      const newModalDialogVersionTestPlanReportsInRDCount =
        newModalDialogVersion.testPlanReports.length;

      // Should still retrieve results from older CANDIDATE version since
      // no DRAFT version was present
      const { testPlanVersion: newModalDialogVersionInDraft } =
        await updateVersionToPhaseQuery(newModalDialogVersion.id, 'DRAFT', {
          testPlanVersionDataToIncludeId: oldModalDialogVersion.id,
          transaction
        });
      const newModalDialogVersionTestPlanReportsInDraft =
        newModalDialogVersionInDraft.updatePhase.testPlanVersion
          .testPlanReports;
      const newModalDialogVersionTestPlanReportsInDraftCount =
        newModalDialogVersionTestPlanReportsInDraft.length;

      // Get JAWS-specific tests count for new version
      const newModalDialogVersionJAWSCompletedTestsInDraftCount =
        countCompletedTests(
          newModalDialogVersionTestPlanReportsInDraft.filter(
            el => el.at.id == 1
          )
        );

      // Get NVDA-specific tests count for new version
      const newModalDialogVersionNVDACompletedTestsInDraftCount =
        countCompletedTests(
          newModalDialogVersionTestPlanReportsInDraft.filter(
            el => el.at.id == 2
          )
        );

      // Get VO-specific tests count for new version
      const newModalDialogVersionVOCompletedTestsInDraftCount =
        countCompletedTests(
          newModalDialogVersionTestPlanReportsInDraft.filter(
            el => el.at.id == 3
          )
        );

      // https://github.com/w3c/aria-at/compare/5fe7afd82fe51c185b8661276105190a59d47322..d0e16b42179de6f6c070da2310e99de837c71215
      // Modal Dialog was updated to show have differences between several NVDA and JAWS tests
      // There are no changes for the VO tests
      expect(oldModalDialogVersion.gitSha).toBe(
        '5fe7afd82fe51c185b8661276105190a59d47322'
      );
      expect(newModalDialogVersion.gitSha).toBe(
        'd0e16b42179de6f6c070da2310e99de837c71215'
      );

      expect(oldModalDialogVersionTestPlanReportsCount).toBeGreaterThan(0);
      expect(newModalDialogVersionTestPlanReportsInRDCount).toBe(0);
      expect(newModalDialogVersionTestPlanReportsInDraftCount).toEqual(
        oldModalDialogVersionTestPlanReportsCount
      );

      expect(oldModalDialogVersionJAWSCompletedTestsCount).toBeGreaterThan(
        newModalDialogVersionJAWSCompletedTestsInDraftCount
      );
      expect(oldModalDialogVersionNVDACompletedTestsCount).toBeGreaterThan(
        newModalDialogVersionNVDACompletedTestsInDraftCount
      );
      expect(oldModalDialogVersionVOCompletedTestsCount).toEqual(
        newModalDialogVersionVOCompletedTestsInDraftCount
      );
    });
  });

  it('updates test plan version and copies all but one report from previous version', async () => {
    await dbCleaner(async transaction => {
      const { ats } = await atsQuery({ transaction });

      // oldModalDialogVersion has reports for JAWS + Chrome,
      // NVDA + Chrome, VO + Safari + additional non-required
      // reports in CANDIDATE
      //
      // Process newModalDialogVersion will be coming in as RD
      const [oldModalDialogVersion, newModalDialogVersion] =
        await getTestableModalDialogVersions(transaction);

      // This version is in 'CANDIDATE' phase. Set it to DRAFT
      // This will also remove the associated TestPlanReports markedFinalAt values
      const oldTestPlanVersionId = oldModalDialogVersion.id;
      await updateVersionToPhaseQuery(oldTestPlanVersionId, 'DRAFT', {
        transaction
      });

      const oldModalDialogVersionTestPlanReports =
        oldModalDialogVersion.testPlanReports;
      const oldModalDialogVersionTestPlanReportsCount =
        oldModalDialogVersionTestPlanReports.length;

      // Get VO+Firefox-specific tests count for old version
      const oldModalDialogVersionVOFirefoxCompletedTestsCount =
        countCompletedTests(
          oldModalDialogVersionTestPlanReports.filter(
            el => el.at.id == 3 && el.browser.id == 1
          )
        );

      // Process new version coming in as RD
      const newModalDialogVersionTestPlanReportsInRDCount =
        newModalDialogVersion.testPlanReports.length;

      await updateVersionToPhaseQuery(newModalDialogVersion.id, 'DRAFT', {
        transaction
      });

      const {
        createTestPlanReport: { testPlanVersion: newModalDialogVersionInDraft }
      } = await createTestPlanReportQuery(
        newModalDialogVersion.id,
        3,
        ats.find(at => at.id == 3).atVersions[0].id,
        1,
        { transaction }
      );

      const newModalDialogVersionTestPlanReportsInDraftCount =
        newModalDialogVersionInDraft.testPlanReports.length;

      const { testPlanVersion: newModalDialogVersionInDraftWithOldResults } =
        await updateVersionToPhaseQuery(newModalDialogVersion.id, 'DRAFT', {
          testPlanVersionDataToIncludeId: oldModalDialogVersion.id,
          transaction
        });
      const newModalDialogVersionTestPlanReportsInDraftWithOldResults =
        newModalDialogVersionInDraftWithOldResults.updatePhase.testPlanVersion
          .testPlanReports;
      const newModalDialogVersionTestPlanReportsInDraftWithOldResultsCount =
        newModalDialogVersionTestPlanReportsInDraftWithOldResults.length;

      // Get VO+Firefox-specific tests count for new version
      const newModalDialogVersionVOFirefoxCompletedTestsInDraftWithOldResultsCount =
        countCompletedTests(
          newModalDialogVersionTestPlanReportsInDraftWithOldResults.filter(
            el => el.at.id == 3 && el.browser.id == 1
          )
        );

      // https://github.com/w3c/aria-at/compare/5fe7afd82fe51c185b8661276105190a59d47322..d0e16b42179de6f6c070da2310e99de837c71215
      // Modal Dialog was updated to show have differences between several NVDA and JAWS tests
      // There are no changes for the VO tests
      expect(oldModalDialogVersion.gitSha).toBe(
        '5fe7afd82fe51c185b8661276105190a59d47322'
      );
      expect(newModalDialogVersion.gitSha).toBe(
        'd0e16b42179de6f6c070da2310e99de837c71215'
      );

      expect(oldModalDialogVersionTestPlanReportsCount).toBeGreaterThan(0);
      expect(newModalDialogVersionTestPlanReportsInRDCount).toBe(0);
      expect(newModalDialogVersionTestPlanReportsInDraftCount).toEqual(1);
      expect(
        newModalDialogVersionTestPlanReportsInDraftWithOldResultsCount
      ).toEqual(oldModalDialogVersionTestPlanReportsCount);

      expect(oldModalDialogVersionVOFirefoxCompletedTestsCount).toBeGreaterThan(
        newModalDialogVersionVOFirefoxCompletedTestsInDraftWithOldResultsCount
      );
      expect(
        newModalDialogVersionVOFirefoxCompletedTestsInDraftWithOldResultsCount
      ).toEqual(0);
    });
  });

  it('updates test plan version but has new reports that are required and not yet marked as final', async () => {
    await dbCleaner(async transaction => {
      const { ats } = await atsQuery({ transaction });

      // oldModalDialogVersion has reports for JAWS + Chrome,
      // NVDA + Chrome, VO + Safari + additional non-required
      // reports in CANDIDATE
      //
      // Process newModalDialogVersion will be coming in as RD
      const [oldModalDialogVersion, newModalDialogVersion] =
        await getTestableModalDialogVersions(transaction);

      const oldModalDialogVersionTestPlanReports =
        oldModalDialogVersion.testPlanReports;
      const oldModalDialogVersionTestPlanReportsCount =
        oldModalDialogVersionTestPlanReports.length;

      // Get VO+Safari-specific tests count for old version
      const oldModalDialogVersionVOSafariCompletedTestsCount =
        countCompletedTests(
          oldModalDialogVersionTestPlanReports.filter(
            el => el.at.id == 3 && el.browser.id == 3
          )
        );

      // Process new version coming in as RD
      const newModalDialogVersionTestPlanReportsInRDCount =
        newModalDialogVersion.testPlanReports.length;

      await updateVersionToPhaseQuery(newModalDialogVersion.id, 'DRAFT', {
        transaction
      });

      const {
        createTestPlanReport: { testPlanVersion: newModalDialogVersionInDraft }
      } = await createTestPlanReportQuery(
        newModalDialogVersion.id,
        3,
        ats.find(at => at.id == 3).atVersions[0].id,
        3,
        { transaction }
      );

      const newModalDialogVersionTestPlanReportsInDraftCount =
        newModalDialogVersionInDraft.testPlanReports.length;

      // A required report isn't marked as final, VO + Safari
      await expect(() => {
        return updateVersionToPhaseQuery(
          newModalDialogVersion.id,
          'CANDIDATE',
          {
            testPlanVersionDataToIncludeId: oldModalDialogVersion.id,
            transaction
          }
        );
      }).rejects.toThrow(/No reports have been marked as final/i);

      // https://github.com/w3c/aria-at/compare/5fe7afd82fe51c185b8661276105190a59d47322..d0e16b42179de6f6c070da2310e99de837c71215
      // Modal Dialog was updated to show have differences between several NVDA and JAWS tests
      // There are no changes for the VO tests
      expect(oldModalDialogVersion.gitSha).toBe(
        '5fe7afd82fe51c185b8661276105190a59d47322'
      );
      expect(newModalDialogVersion.gitSha).toBe(
        'd0e16b42179de6f6c070da2310e99de837c71215'
      );

      expect(oldModalDialogVersionTestPlanReportsCount).toBeGreaterThan(0);
      expect(oldModalDialogVersionVOSafariCompletedTestsCount).toBeGreaterThan(
        0
      );
      expect(newModalDialogVersionTestPlanReportsInRDCount).toBe(0);
      expect(newModalDialogVersionTestPlanReportsInDraftCount).toEqual(1);
    });
  });

  it('updates test plan version over another which had all test plan reports as final but removes final for all newly created test plan reports', async () => {
    await dbCleaner(async transaction => {
      function markedFinalAtFilter({ markedFinalAt }) {
        return !!markedFinalAt;
      }

      function completedResultsCount(testPlanReports, atId) {
        return (
          testPlanReports
            .find(({ at }) => at.id == atId)
            // 0 because only 1 tester for each already marked final
            // report matters during this test
            .draftTestPlanRuns[0].testResults.filter(
              ({ completedAt }) => !!completedAt
            ).length
        );
      }

      const [oldCommandButtonVersion, newCommandButtonVersion] =
        await getTestableCommandButtonVersions(transaction);

      // Process counts for old test plan version
      const oldCommandButtonVersionMarkedFinalReportsCount =
        oldCommandButtonVersion.testPlanReports.filter(
          markedFinalAtFilter
        ).length;
      const oldCommandButtonJawsCompletedTestResultsCount =
        completedResultsCount(oldCommandButtonVersion.testPlanReports, 1);
      const oldCommandButtonNvdaCompletedTestResultsCount =
        completedResultsCount(oldCommandButtonVersion.testPlanReports, 2);
      const oldCommandButtonSafariCompletedTestResultsCount =
        completedResultsCount(oldCommandButtonVersion.testPlanReports, 3);

      // Process counts for new test plan version
      const { testPlanVersion: newCommandButtonVersionInDraft } =
        await updateVersionToPhaseQuery(newCommandButtonVersion.id, 'DRAFT', {
          testPlanVersionDataToIncludeId: oldCommandButtonVersion.id,
          transaction
        });
      const newCommandButtonVersionInDraftMarkedFinalReportsCount =
        newCommandButtonVersionInDraft.updatePhase.testPlanVersion.testPlanReports.filter(
          markedFinalAtFilter
        ).length;
      const newCommandButtonJawsCompletedTestResultsCount =
        completedResultsCount(
          newCommandButtonVersionInDraft.updatePhase.testPlanVersion
            .testPlanReports,
          1
        );
      const newCommandButtonNvdaCompletedTestResultsCount =
        completedResultsCount(
          newCommandButtonVersionInDraft.updatePhase.testPlanVersion
            .testPlanReports,
          2
        );
      const newCommandButtonSafariCompletedTestResultsCount =
        completedResultsCount(
          newCommandButtonVersionInDraft.updatePhase.testPlanVersion
            .testPlanReports,
          3
        );

      // The difference between them is that there have been updated settings for VoiceOver tests;
      // 2 were switched from 'quickNavOn' to 'singleQuickKeyNavOn'
      //
      // Based on https://github.com/w3c/aria-at/compare/d9a19f8...565a87b#diff-4e3dcd0a202f268ebec2316344f136c3a83d6e03b3f726775cb46c57322ff3a0,
      // only 'navForwardsToButton' and 'navBackToButton' tests were affected. The individual tests for
      // 'reqInfoAboutButton' should still match.
      //
      // This means only 1 test plan report was affected results-wise, for VoiceOver, but they should all still be
      // unmarked as final. The single JAWS and NVDA reports should have unaffected results but also unmarked as
      // final.
      expect(oldCommandButtonVersionMarkedFinalReportsCount).toBeGreaterThan(0);
      expect(newCommandButtonVersionInDraftMarkedFinalReportsCount).toEqual(0);
      expect(newCommandButtonJawsCompletedTestResultsCount).toEqual(
        oldCommandButtonJawsCompletedTestResultsCount
      );
      expect(newCommandButtonNvdaCompletedTestResultsCount).toEqual(
        oldCommandButtonNvdaCompletedTestResultsCount
      );
      expect(newCommandButtonSafariCompletedTestResultsCount).toEqual(
        oldCommandButtonSafariCompletedTestResultsCount - 2
      );
    });
  });

  it('preserves results for copied report combinations where commands or assertions are unchanged', async () => {
    await dbCleaner(async transaction => {
      function countCollectedAssertionResults(run) {
        return run.testResults.reduce((trSum, tr) => {
          return (
            trSum +
            tr.scenarioResults.reduce((srSum, sr) => {
              // Check if assertion has been collected; null
              // if not yet collected
              return (
                srSum +
                sr.assertionResults.filter(({ passed }) => passed != null)
                  .length
              );
            }, 0)
          );
        }, 0);
      }

      const [oldCommandButtonVersion, newCommandButtonVersion] =
        await getTestableCommandButtonVersions(transaction);

      // Process counts for old version
      const oldJAWSReport = oldCommandButtonVersion.testPlanReports.find(
        ({ at }) => at.id == 1
      );
      const oldNVDAReport = oldCommandButtonVersion.testPlanReports.find(
        ({ at }) => at.id == 2
      );
      const oldVOReport = oldCommandButtonVersion.testPlanReports.find(
        ({ at }) => at.id == 3
      );

      // They're all marked as final so only one run matters for this test
      const [oldJAWSRun] = oldJAWSReport.draftTestPlanRuns;
      const [oldNVDARun] = oldNVDAReport.draftTestPlanRuns;
      const [oldVORun] = oldVOReport.draftTestPlanRuns;

      // Simulate that runs were created using bots
      await rawQuery(
        `update "TestPlanRun" set "initiatedByAutomation" = true where id = ${oldNVDARun.id};`,
        { transaction }
      );

      await rawQuery(
        `update "TestPlanRun" set "initiatedByAutomation" = true where id = ${oldVORun.id};`,
        { transaction }
      );

      const oldJAWSAssertionsCollectedCount =
        countCollectedAssertionResults(oldJAWSRun);
      const oldNVDAAssertionsCollectedCount =
        countCollectedAssertionResults(oldNVDARun);
      const oldVOAssertionsCollectedCount =
        countCollectedAssertionResults(oldVORun);

      // Process counts for new version
      const { testPlanVersion: newCommandButtonVersionInDraft } =
        await updateVersionToPhaseQuery(newCommandButtonVersion.id, 'DRAFT', {
          testPlanVersionDataToIncludeId: oldCommandButtonVersion.id,
          transaction
        });

      const newJAWSReport =
        newCommandButtonVersionInDraft.updatePhase.testPlanVersion.testPlanReports.find(
          ({ at }) => at.id == 1
        );
      const newNVDAReport =
        newCommandButtonVersionInDraft.updatePhase.testPlanVersion.testPlanReports.find(
          ({ at }) => at.id == 2
        );
      const newVOReport =
        newCommandButtonVersionInDraft.updatePhase.testPlanVersion.testPlanReports.find(
          ({ at }) => at.id == 3
        );

      // They're all marked as final so only one run matters for this test
      const [newJAWSRun] = newJAWSReport.draftTestPlanRuns;
      const [newNVDARun] = newNVDAReport.draftTestPlanRuns;
      const [newVORun] = newVOReport.draftTestPlanRuns;

      const newJAWSAssertionsCollectedCount =
        countCollectedAssertionResults(newJAWSRun);
      const newNVDAAssertionsCollectedCount =
        countCollectedAssertionResults(newNVDARun);
      const newVOAssertionsCollectedCount =
        countCollectedAssertionResults(newVORun);

      // Confirm that `initiatedByAutomation` persists across copying of results
      expect(newJAWSRun.initiatedByAutomation).toBe(false);
      expect(newNVDARun.initiatedByAutomation).toBe(true);
      expect(newVORun.initiatedByAutomation).toBe(true);

      // The difference between them is that there have been updated settings for VoiceOver tests;
      // 2 were switched from 'quickNavOn' to 'singleQuickKeyNavOn' which means the tracked command
      // has been changed.
      //
      // Based on https://github.com/w3c/aria-at/compare/d9a19f8...565a87b#diff-4e3dcd0a202f268ebec2316344f136c3a83d6e03b3f726775cb46c57322ff3a0,
      // only 'navForwardsToButton' and 'navBackToButton' tests were affected. The individual tests for
      // 'reqInfoAboutButton' should still match.
      //
      // This means only 1 test plan report should be affected, for VoiceOver for 2 tests,
      // for 1 command, which carries 2 assertions. So 2 tests * 2 assertions = 4 assertions
      // have been affected.
      // The JAWS and NVDA reports should be unaffected.
      expect(newJAWSAssertionsCollectedCount).toEqual(
        oldJAWSAssertionsCollectedCount
      );
      expect(newNVDAAssertionsCollectedCount).toEqual(
        oldNVDAAssertionsCollectedCount
      );
      expect(newVOAssertionsCollectedCount).toEqual(
        oldVOAssertionsCollectedCount - 4
      );
    });
  });

  it('keeps approval status across version updates if no substantial changes', async () => {
    await dbCleaner(async transaction => {
      // The difference between them is that there have been updated settings for VoiceOver tests;
      // 2 were switched from 'quickNavOn' to 'singleQuickKeyNavOn'
      //
      // Based on https://github.com/w3c/aria-at/compare/d9a19f8...565a87b#diff-4e3dcd0a202f268ebec2316344f136c3a83d6e03b3f726775cb46c57322ff3a0,
      // only 'navForwardsToButton' and 'navBackToButton' tests were affected. The individual tests for
      // 'reqInfoAboutButton' should still match.
      //
      // This means that only VO + Safari tests will have changed and that vendor approval result cannot
      // be brought forward if the results are copied.
      //
      // The JAWS and NVDA reports should have unaffected results and their vendor approval status can be copied.
      const [oldCommandButtonVersion, newCommandButtonVersion] =
        await getTestableCommandButtonVersions(transaction);

      // Move the old version to CANDIDATE (all the reports are already final)
      await updateVersionToPhaseQuery(oldCommandButtonVersion.id, 'CANDIDATE', {
        transaction
      });

      // Make sure the reports are all approved
      for (const testPlanReport of oldCommandButtonVersion.testPlanReports) {
        setCustomUser({
          ...getDefaultUser(),
          roles: [...getDefaultUser().roles, { name: 'VENDOR' }],
          vendorId: testPlanReport.at.vendorId
        });

        // To ensure at least one ReviewerStatus exists so it can be approved
        await addViewer(
          testPlanReport.draftTestPlanRuns[0].testResults[0].test.id,
          testPlanReport.id,
          { transaction }
        );
        await updateVendorReviewStatus(testPlanReport.id, 'APPROVED', {
          transaction
        });
      }

      const afterOldVersionVendorUpdateStatus = await query(
        gql`
          query {
            testPlanVersion(id: ${oldCommandButtonVersion.id}) {
              id
              phase
              testPlanReports {
                id
                markedFinalAt
                vendorReviewStatus
              }
            }
          }
        `,
        { transaction }
      );

      // Move the new version to DRAFT
      await updateVersionToPhaseQuery(newCommandButtonVersion.id, 'DRAFT', {
        testPlanVersionDataToIncludeId: oldCommandButtonVersion.id,
        transaction
      });

      // Confirm all the reports have been copied and marked as final
      const afterNewVersionPhaseUpdateStatus = await query(
        gql`
          query {
            testPlanVersion(id: ${newCommandButtonVersion.id}) {
              id
              phase
              testPlanReports {
                id
                markedFinalAt
                vendorReviewStatus
                draftTestPlanRuns {
                  id
                  testResults {
                    id
                    scenarioResults {
                      id
                      output
                      assertionResults {
                        id
                        passed
                      }
                    }
                    test {
                      id
                    }
                  }
                }
              }
            }
          }
        `,
        { transaction }
      );

      // Confirm that a few on VO still need to be updated to be marked as final
      for (const testPlanReport of afterNewVersionPhaseUpdateStatus
        .testPlanVersion.testPlanReports) {
        // The 'copied' vendor review status would be available with the results
        // copy process
        if (!testPlanReport.vendorReviewStatus) {
          // Only 1 tester is assigned in this test scenario
          const testPlanRun = testPlanReport.draftTestPlanRuns[0];

          for (const testResult of testPlanRun.testResults) {
            let baseTestResult = {
              id: testResult.id,
              scenarioResults: testResult.scenarioResults
            };

            // This needs to be populated since some tests will be missing data
            if (
              baseTestResult.scenarioResults.some(
                scenarioResult => scenarioResult.output === null
              )
            ) {
              baseTestResult = {
                ...baseTestResult,
                atVersionId: 3, // for this test, we know it uses a specific VO version
                browserVersionId: 3, // for this test, we know it uses a specific Safari version
                scenarioResults: baseTestResult.scenarioResults.map(
                  scenarioResult => {
                    if (scenarioResult.output === null) {
                      return {
                        ...scenarioResult,
                        output: 'sample output',
                        assertionResults: scenarioResult.assertionResults.map(
                          assertionResult => ({
                            ...assertionResult,
                            passed: false
                          })
                        ),
                        negativeSideEffects: []
                      };
                    } else return scenarioResult;
                  }
                )
              };
            }
            await submitTestResult(testResult.id, baseTestResult, {
              transaction
            });
          }
        }
        // Mark all reports as final
        await markAsFinal(testPlanReport.id, { transaction });
      }

      // Advance new version to CANDIDATE as well
      await updateVersionToPhaseQuery(newCommandButtonVersion.id, 'CANDIDATE', {
        transaction
      });

      // Confirm the NVDA and JAWS versions are still approved but VO is marked as "In Progress"
      const { testPlanVersion: newCommandButtonVersionAfterFinalPhaseUpdate } =
        await query(
          gql`
        query {
          testPlanVersion(id: ${newCommandButtonVersion.id}) {
            id
            phase
            testPlanReports {
              id
              at {
                id
              }
              browser {
                id
              }
              vendorReviewStatus
            }
          }
        }
        `,
          { transaction }
        );

      expect(
        afterOldVersionVendorUpdateStatus.testPlanVersion.testPlanReports.every(
          report => report.vendorReviewStatus === 'APPROVED'
        )
      ).toBe(true);
      expect(
        afterOldVersionVendorUpdateStatus.testPlanVersion.testPlanReports.length
      ).toEqual(3);
      expect(
        afterNewVersionPhaseUpdateStatus.testPlanVersion.testPlanReports.filter(
          report => report.vendorReviewStatus === 'APPROVED'
        ).length
      ).toEqual(2);
      expect(
        afterNewVersionPhaseUpdateStatus.testPlanVersion.testPlanReports.length
      ).toEqual(3);
      expect(newCommandButtonVersionAfterFinalPhaseUpdate.phase).toBe(
        'CANDIDATE'
      );
      expect(
        newCommandButtonVersionAfterFinalPhaseUpdate.testPlanReports.length
      ).toEqual(3);
      expect(
        newCommandButtonVersionAfterFinalPhaseUpdate.testPlanReports.filter(
          report => report.vendorReviewStatus === 'APPROVED'
        ).length
      ).toEqual(2);
      // Confirm only the Safari + VO combination is not marked as approved
      expect(
        newCommandButtonVersionAfterFinalPhaseUpdate.testPlanReports.find(
          report => report.vendorReviewStatus !== 'APPROVED'
        ).at.id === '3' &&
          newCommandButtonVersionAfterFinalPhaseUpdate.testPlanReports.find(
            report => report.vendorReviewStatus !== 'APPROVED'
          ).browser.id === '3'
      ).toBe(true);
    });
  });
});
