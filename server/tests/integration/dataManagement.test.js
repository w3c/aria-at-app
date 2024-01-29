const { gql } = require('apollo-server');
const dbCleaner = require('../util/db-cleaner');
const { query, mutate } = require('../util/graphql-test-utilities');
const db = require('../../models');

jest.setTimeout(20000);

afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await db.sequelize.close();
}, 20000);

const testPlanVersionsQuery = () => {
    return query(gql`
        query {
            testPlanVersions(phases: [RD, DRAFT, CANDIDATE]) {
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
                    browser {
                        id
                    }
                    draftTestPlanRuns {
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
                                atMode
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
    `);
};

const updateVersionToPhaseQuery = (
    testPlanVersionId,
    phase,
    { testPlanVersionDataToIncludeId } = {}
) => {
    return mutate(gql`
        mutation {
            testPlanVersion(id: ${testPlanVersionId}) {
                updatePhase(
                    phase: ${phase}
                    testPlanVersionDataToIncludeId: ${
                        testPlanVersionDataToIncludeId ?? null
                    }
                ) {
                    testPlanVersion {
                        phase
                        testPlanReports {
                            id
                            markedFinalAt
                            at {
                                id
                            }
                            browser {
                                id
                            }
                            draftTestPlanRuns {
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
                                        atMode
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
    `);
};

const findOrCreateTestPlanReportQuery = (
    testPlanVersionId,
    atId,
    browserId
) => {
    return mutate(gql`
        mutation {
            findOrCreateTestPlanReport(input: {
                testPlanVersionId: ${testPlanVersionId}
                atId: ${atId}
                browserId: ${browserId}
            }) {
                populatedData {
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
                created {
                    locationOfData
                }
            }
        }
    `);
};

const markAsFinal = testPlanReportId => {
    return mutate(gql`
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
    `);
};

const countCompletedTests = testPlanReports => {
    return testPlanReports.reduce((acc, testPlanReport) => {
        return (
            acc +
                testPlanReport.draftTestPlanRuns[0]?.testResults.reduce(
                    (acc, testResult) =>
                        testResult.completedAt ? acc + 1 : acc,
                    0
                ) || 0
        );
    }, 0);
};

describe('data management', () => {
    it('can set test plan version to candidate and recommended', async () => {
        await dbCleaner(async () => {
            const candidateTestPlanVersions = await query(gql`
                query {
                    testPlanVersions(phases: [CANDIDATE]) {
                        id
                        phase
                    }
                }
            `);
            const candidateTestPlanVersion =
                candidateTestPlanVersions.testPlanVersions[0];

            // This version is in 'CANDIDATE' phase. Set it to DRAFT
            // This will also remove the associated TestPlanReports markedFinalAt values
            const testPlanVersionId = candidateTestPlanVersion.id;
            await updateVersionToPhaseQuery(testPlanVersionId, 'DRAFT');

            const previous = await query(gql`
                query {
                    testPlanVersion(id: ${testPlanVersionId}) {
                        phase
                        testPlanReports {
                            id
                        }
                    }
                }
            `);
            const previousPhase = previous.testPlanVersion.phase;
            const previousPhaseTestPlanReportId =
                previous.testPlanVersion.testPlanReports[0].id;

            // Need to approve at least one of the associated reports
            await markAsFinal(previousPhaseTestPlanReportId);

            // Check to see that the testPlanVersion cannot be updated until the reports have been
            // finalized
            await expect(() => {
                return updateVersionToPhaseQuery(
                    testPlanVersionId,
                    'CANDIDATE'
                );
            }).rejects.toThrow(
                /Cannot set phase to candidate because the following required reports have not been collected or finalized:/i
            );

            const testPlanReportsToMarkAsFinalResult = await query(gql`
                query {
                    testPlanReports(testPlanVersionId: ${testPlanVersionId}) {
                        id
                    }
                }
            `);

            for (const testPlanReport of testPlanReportsToMarkAsFinalResult.testPlanReports) {
                await markAsFinal(testPlanReport.id);
            }

            const candidateResult = await updateVersionToPhaseQuery(
                testPlanVersionId,
                'CANDIDATE'
            );
            const candidateResultPhase =
                candidateResult.testPlanVersion.updatePhase.testPlanVersion
                    .phase;

            const recommendedResult = await updateVersionToPhaseQuery(
                testPlanVersionId,
                'RECOMMENDED'
            );
            const recommendedResultPhase =
                recommendedResult.testPlanVersion.updatePhase.testPlanVersion
                    .phase;

            expect(candidateTestPlanVersion.phase).toBe('CANDIDATE');
            expect(previousPhase).not.toBe('CANDIDATE');
            expect(candidateResultPhase).toBe('CANDIDATE');
            expect(recommendedResultPhase).toBe('RECOMMENDED');
        });
    });

    it('updates test plan version and copies results from previous version reports', async () => {
        await dbCleaner(async () => {
            const testPlanVersions = await testPlanVersionsQuery();

            // This has reports for JAWS + Chrome, NVDA + Chrome, VO + Safari + additional
            // non-required reports
            const [oldModalDialogVersion] =
                testPlanVersions.testPlanVersions.filter(
                    e =>
                        e.testPlan.directory === 'modal-dialog' &&
                        e.phase === 'CANDIDATE'
                );

            // This version is in 'CANDIDATE' phase. Set it to DRAFT
            // This will also remove the associated TestPlanReports markedFinalAt values
            const oldTestPlanVersionId = oldModalDialogVersion.id;
            await updateVersionToPhaseQuery(oldTestPlanVersionId, 'DRAFT');

            const oldModalDialogVersionTestPlanReports =
                oldModalDialogVersion.testPlanReports;
            const oldModalDialogVersionTestPlanReportsCount =
                oldModalDialogVersionTestPlanReports.length;

            // Get JAWS-specific tests count for old version
            const oldModalDialogVersionJAWSCompletedTestsCount =
                countCompletedTests(
                    oldModalDialogVersionTestPlanReports.filter(
                        el => el.at.id == 1
                    )
                );

            // Get NVDA-specific tests count for old version
            const oldModalDialogVersionNVDACompletedTestsCount =
                countCompletedTests(
                    oldModalDialogVersionTestPlanReports.filter(
                        el => el.at.id == 2
                    )
                );

            // Get VO-specific tests count for old version
            const oldModalDialogVersionVOCompletedTestsCount =
                countCompletedTests(
                    oldModalDialogVersionTestPlanReports.filter(
                        el => el.at.id == 3
                    )
                );

            const [newModalDialogVersion] =
                testPlanVersions.testPlanVersions.filter(
                    e =>
                        e.testPlan.directory === 'modal-dialog' &&
                        e.phase === 'RD'
                );
            const newModalDialogVersionTestPlanReportsInRDCount =
                newModalDialogVersion.testPlanReports.length;

            const { testPlanVersion: newModalDialogVersionInDraft } =
                await updateVersionToPhaseQuery(
                    newModalDialogVersion.id,
                    'DRAFT',
                    {
                        testPlanVersionDataToIncludeId: oldModalDialogVersion.id
                    }
                );
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

            expect(oldModalDialogVersionTestPlanReportsCount).toBeGreaterThan(
                0
            );
            expect(newModalDialogVersionTestPlanReportsInRDCount).toBe(0);
            expect(newModalDialogVersionTestPlanReportsInDraftCount).toEqual(
                oldModalDialogVersionTestPlanReportsCount
            );

            expect(
                oldModalDialogVersionJAWSCompletedTestsCount
            ).toBeGreaterThan(
                newModalDialogVersionJAWSCompletedTestsInDraftCount
            );
            expect(
                oldModalDialogVersionNVDACompletedTestsCount
            ).toBeGreaterThan(
                newModalDialogVersionNVDACompletedTestsInDraftCount
            );
            expect(oldModalDialogVersionVOCompletedTestsCount).toEqual(
                newModalDialogVersionVOCompletedTestsInDraftCount
            );
        });
    });

    it('updates test plan version and copies all but one report from previous version', async () => {
        await dbCleaner(async () => {
            const testPlanVersions = await testPlanVersionsQuery();

            // This has reports for JAWS + Chrome, NVDA + Chrome, VO + Safari + additional
            // non-required reports
            const [oldModalDialogVersion] =
                testPlanVersions.testPlanVersions.filter(
                    e =>
                        e.testPlan.directory === 'modal-dialog' &&
                        e.phase === 'CANDIDATE'
                );

            // This version is in 'CANDIDATE' phase. Set it to DRAFT
            // This will also remove the associated TestPlanReports markedFinalAt values
            const oldTestPlanVersionId = oldModalDialogVersion.id;
            await updateVersionToPhaseQuery(oldTestPlanVersionId, 'DRAFT');

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

            const [newModalDialogVersion] =
                testPlanVersions.testPlanVersions.filter(
                    e =>
                        e.testPlan.directory === 'modal-dialog' &&
                        e.phase === 'RD'
                );
            const newModalDialogVersionTestPlanReportsInRDCount =
                newModalDialogVersion.testPlanReports.length;

            await updateVersionToPhaseQuery(newModalDialogVersion.id, 'DRAFT');

            const {
                findOrCreateTestPlanReport: {
                    populatedData: {
                        testPlanVersion: newModalDialogVersionInDraft
                    }
                }
            } = await findOrCreateTestPlanReportQuery(
                newModalDialogVersion.id,
                3,
                1
            );

            const newModalDialogVersionTestPlanReportsInDraftCount =
                newModalDialogVersionInDraft.testPlanReports.length;

            const {
                testPlanVersion: newModalDialogVersionInDraftWithOldResults
            } = await updateVersionToPhaseQuery(
                newModalDialogVersion.id,
                'DRAFT',
                {
                    testPlanVersionDataToIncludeId: oldModalDialogVersion.id
                }
            );
            const newModalDialogVersionTestPlanReportsInDraftWithOldResults =
                newModalDialogVersionInDraftWithOldResults.updatePhase
                    .testPlanVersion.testPlanReports;
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

            expect(oldModalDialogVersionTestPlanReportsCount).toBeGreaterThan(
                0
            );
            expect(newModalDialogVersionTestPlanReportsInRDCount).toBe(0);
            expect(newModalDialogVersionTestPlanReportsInDraftCount).toEqual(1);
            expect(
                newModalDialogVersionTestPlanReportsInDraftWithOldResultsCount
            ).toEqual(oldModalDialogVersionTestPlanReportsCount);

            expect(
                oldModalDialogVersionVOFirefoxCompletedTestsCount
            ).toBeGreaterThan(
                newModalDialogVersionVOFirefoxCompletedTestsInDraftWithOldResultsCount
            );
            expect(
                newModalDialogVersionVOFirefoxCompletedTestsInDraftWithOldResultsCount
            ).toEqual(0);
        });
    });

    it('updates test plan version but has new reports that are required and not yet marked as final', async () => {
        await dbCleaner(async () => {
            const testPlanVersions = await testPlanVersionsQuery();

            // This has reports for JAWS + Chrome, NVDA + Chrome, VO + Safari + additional
            // non-required reports
            const [oldModalDialogVersion] =
                testPlanVersions.testPlanVersions.filter(
                    e =>
                        e.testPlan.directory === 'modal-dialog' &&
                        e.phase === 'CANDIDATE'
                );
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

            const [newModalDialogVersion] =
                testPlanVersions.testPlanVersions.filter(
                    e =>
                        e.testPlan.directory === 'modal-dialog' &&
                        e.phase === 'RD'
                );
            const newModalDialogVersionTestPlanReportsInRDCount =
                newModalDialogVersion.testPlanReports.length;

            await updateVersionToPhaseQuery(newModalDialogVersion.id, 'DRAFT');

            const {
                findOrCreateTestPlanReport: {
                    populatedData: {
                        testPlanVersion: newModalDialogVersionInDraft
                    }
                }
            } = await findOrCreateTestPlanReportQuery(
                newModalDialogVersion.id,
                3,
                3
            );

            const newModalDialogVersionTestPlanReportsInDraftCount =
                newModalDialogVersionInDraft.testPlanReports.length;

            // A required report isn't marked as final, VO + Safari
            await expect(() => {
                return updateVersionToPhaseQuery(
                    newModalDialogVersion.id,
                    'CANDIDATE',
                    {
                        testPlanVersionDataToIncludeId: oldModalDialogVersion.id
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

            expect(oldModalDialogVersionTestPlanReportsCount).toBeGreaterThan(
                0
            );
            expect(
                oldModalDialogVersionVOSafariCompletedTestsCount
            ).toBeGreaterThan(0);
            expect(newModalDialogVersionTestPlanReportsInRDCount).toBe(0);
            expect(newModalDialogVersionTestPlanReportsInDraftCount).toEqual(1);
        });
    });

    it('updates test plan version but removes marked as final for test plan report when new report has incomplete runs', async () => {
        await dbCleaner(async () => {
            function markedFinalAtReduce(acc, curr) {
                return acc + (curr.markedFinalAt ? 1 : 0);
            }

            const testPlanVersions = await testPlanVersionsQuery();

            const [oldCommandButtonVersion] =
                testPlanVersions.testPlanVersions.filter(
                    e =>
                        e.testPlan.directory === 'command-button' &&
                        e.phase === 'DRAFT' &&
                        e.metadata.testFormatVersion === 2
                );

            const oldCommandButtonVersionMarkedFinalReportsCount =
                oldCommandButtonVersion.testPlanReports.reduce(
                    markedFinalAtReduce,
                    0
                );

            const [newCommandButtonVersion] =
                testPlanVersions.testPlanVersions.filter(
                    e =>
                        e.testPlan.directory === 'command-button' &&
                        e.phase === 'RD' &&
                        e.metadata.testFormatVersion === 2
                );

            const { testPlanVersion: newCommandButtonVersionInDraft } =
                await updateVersionToPhaseQuery(
                    newCommandButtonVersion.id,
                    'DRAFT',
                    {
                        testPlanVersionDataToIncludeId:
                            oldCommandButtonVersion.id
                    }
                );
            const newCommandButtonVersionInDraftMarkedFinalReportsCount =
                newCommandButtonVersionInDraft.updatePhase.testPlanVersion.testPlanReports.reduce(
                    markedFinalAtReduce,
                    0
                );

            // The difference between them is that there have been updated settings for VoiceOver tests;
            // 2 were switched from 'quickNavOn' to 'singleQuickKeyNavOn'
            //
            // Based on https://github.com/w3c/aria-at/compare/d9a19f8...565a87b#diff-4e3dcd0a202f268ebec2316344f136c3a83d6e03b3f726775cb46c57322ff3a0,
            // only 'navForwardsToButton' and 'navBackToButton' tests were affected. The individual tests for
            // 'reqInfoAboutButton' should still match
            //
            // This means only 1 test plan report should be affected, for VoiceOver and now unmarked as final.
            // The single JAWS and NVDA reports should be unaffected
            expect(
                newCommandButtonVersionInDraftMarkedFinalReportsCount
            ).toBeGreaterThan(1);
            expect(
                newCommandButtonVersionInDraftMarkedFinalReportsCount
            ).toEqual(oldCommandButtonVersionMarkedFinalReportsCount - 1);
        });
    });
});
