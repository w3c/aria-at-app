const { gql } = require('apollo-server');
const dbCleaner = require('../util/db-cleaner');
const { query, mutate } = require('../util/graphql-test-utilities');
const db = require('../../models');

beforeAll(() => {
    jest.setTimeout(40000);
});

afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await db.sequelize.close();
});

describe('data management', () => {
    const testPlanVersionsQuery = () => {
        return query(gql`
            query {
                testPlanVersions(phases: [RD, CANDIDATE]) {
                    id
                    phase
                    gitSha
                    testPlan {
                        directory
                    }
                    testPlanReports {
                        id
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
        testPlanVersionDataToIncludeId,
        phase
    ) => {
        return mutate(gql`
            mutation {
                testPlanVersion(id: ${testPlanVersionId}) {
                    updatePhase(
                        phase: ${phase}
                        testPlanVersionDataToIncludeId: ${testPlanVersionDataToIncludeId}
                    ) {
                        testPlanVersion {
                            phase
                            testPlanReports {
                                id
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

            let testPlanVersionId = candidateTestPlanVersion.id;
            // This version is in 'CANDIDATE' phase. Let's set it to DRAFT
            // This will also remove the associated TestPlanReports markedFinalAt values
            await mutate(gql`
                mutation {
                    testPlanVersion(id: ${testPlanVersionId}) {
                        updatePhase(phase: DRAFT) {
                            testPlanVersion {
                                phase
                            }
                        }
                    }
                }
            `);

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
            await mutate(gql`
                mutation {
                    testPlanReport(id: ${previousPhaseTestPlanReportId}) {
                        markAsFinal {
                            testPlanReport {
                                id
                                markedFinalAt
                            }
                        }
                    }
                }
            `);

            // Check to see that the testPlanVersion cannot be updated until the reports have been
            // finalized
            await expect(() => {
                return mutate(gql`
                    mutation {
                        testPlanVersion(id: ${testPlanVersionId}) {
                            updatePhase(phase: CANDIDATE) {
                                testPlanVersion {
                                    phase
                                }
                            }
                        }
                    }
                `);
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
                await mutate(gql`
                    mutation {
                        testPlanReport(id: ${testPlanReport.id}) {
                            markAsFinal {
                                testPlanReport {
                                    id
                                    markedFinalAt
                                }
                            }
                        }
                    }

                `);
            }

            const candidateResult = await mutate(gql`
                mutation {
                    testPlanVersion(id: ${testPlanVersionId}) {
                        updatePhase(phase: CANDIDATE) {
                            testPlanVersion {
                                phase
                            }
                        }
                    }
                }
            `);
            const candidateResultPhase =
                candidateResult.testPlanVersion.updatePhase.testPlanVersion
                    .phase;

            const recommendedResult = await mutate(gql`
                mutation {
                    testPlanVersion(id: ${testPlanVersionId}) {
                        updatePhase(phase: RECOMMENDED) {
                            testPlanVersion {
                                phase
                            }
                        }
                    }
                }
            `);
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
                await mutate(gql`
                mutation {
                    testPlanVersion(id: ${newModalDialogVersion.id}) {
                        updatePhase(phase: DRAFT) {
                            testPlanVersion {
                                phase
                                testPlanReports {
                                    id
                                }
                            }
                        }
                    }
                }
            `);
            const newModalDialogVersionTestPlanReportsInDraftCount =
                newModalDialogVersionInDraft.updatePhase.testPlanVersion
                    .testPlanReports.length;

            const { testPlanVersion: newModalDialogVersionInCandidate } =
                await updateVersionToPhaseQuery(
                    newModalDialogVersion.id,
                    oldModalDialogVersion.id,
                    'CANDIDATE'
                );
            const newModalDialogVersionTestPlanReportsInCandidate =
                newModalDialogVersionInCandidate.updatePhase.testPlanVersion
                    .testPlanReports;
            const newModalDialogVersionTestPlanReportsInCandidateCount =
                newModalDialogVersionTestPlanReportsInCandidate.length;

            // Get JAWS-specific tests count for new version
            const newModalDialogVersionJAWSCompletedTestsInCandidateCount =
                countCompletedTests(
                    newModalDialogVersionTestPlanReportsInCandidate.filter(
                        el => el.at.id == 1
                    )
                );

            // Get NVDA-specific tests count for new version
            const newModalDialogVersionNVDACompletedTestsInCandidateCount =
                countCompletedTests(
                    newModalDialogVersionTestPlanReportsInCandidate.filter(
                        el => el.at.id == 2
                    )
                );

            // Get VO-specific tests count for new version
            const newModalDialogVersionVOCompletedTestsInCandidateCount =
                countCompletedTests(
                    newModalDialogVersionTestPlanReportsInCandidate.filter(
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
            expect(newModalDialogVersionTestPlanReportsInDraftCount).toEqual(0);
            expect(
                newModalDialogVersionTestPlanReportsInCandidateCount
            ).toEqual(oldModalDialogVersionTestPlanReportsCount);

            expect(
                oldModalDialogVersionJAWSCompletedTestsCount
            ).toBeGreaterThan(
                newModalDialogVersionJAWSCompletedTestsInCandidateCount
            );
            expect(
                oldModalDialogVersionNVDACompletedTestsCount
            ).toBeGreaterThan(
                newModalDialogVersionNVDACompletedTestsInCandidateCount
            );
            expect(oldModalDialogVersionVOCompletedTestsCount).toEqual(
                newModalDialogVersionVOCompletedTestsInCandidateCount
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

            await mutate(gql`
                mutation {
                    testPlanVersion(id: ${newModalDialogVersion.id}) {
                        updatePhase(phase: DRAFT) {
                            testPlanVersion {
                                phase
                                testPlanReports {
                                    id
                                }
                            }
                        }
                    }
                }
            `);

            const {
                findOrCreateTestPlanReport: {
                    populatedData: {
                        testPlanVersion: newModalDialogVersionInDraft
                    }
                }
            } = await mutate(gql`
                mutation {
                    findOrCreateTestPlanReport(input: {
                        testPlanVersionId: ${newModalDialogVersion.id}
                        atId: 3
                        browserId: 1
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

            const newModalDialogVersionTestPlanReportsInDraftCount =
                newModalDialogVersionInDraft.testPlanReports.length;

            const { testPlanVersion: newModalDialogVersionInCandidate } =
                await updateVersionToPhaseQuery(
                    newModalDialogVersion.id,
                    oldModalDialogVersion.id,
                    'CANDIDATE'
                );
            const newModalDialogVersionTestPlanReportsInCandidate =
                newModalDialogVersionInCandidate.updatePhase.testPlanVersion
                    .testPlanReports;
            const newModalDialogVersionTestPlanReportsInCandidateCount =
                newModalDialogVersionTestPlanReportsInCandidate.length;

            // Get VO+Firefox-specific tests count for new version
            const newModalDialogVersionVOFirefoxCompletedTestsInCandidateCount =
                countCompletedTests(
                    newModalDialogVersionTestPlanReportsInCandidate.filter(
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
                newModalDialogVersionTestPlanReportsInCandidateCount
            ).toEqual(oldModalDialogVersionTestPlanReportsCount);

            expect(
                oldModalDialogVersionVOFirefoxCompletedTestsCount
            ).toBeGreaterThan(
                newModalDialogVersionVOFirefoxCompletedTestsInCandidateCount
            );
            expect(
                newModalDialogVersionVOFirefoxCompletedTestsInCandidateCount
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

            await mutate(gql`
                    mutation {
                        testPlanVersion(id: ${newModalDialogVersion.id}) {
                            updatePhase(phase: DRAFT) {
                                testPlanVersion {
                                    phase
                                    testPlanReports {
                                        id
                                    }
                                }
                            }
                        }
                    }
                `);

            const {
                findOrCreateTestPlanReport: {
                    populatedData: {
                        testPlanVersion: newModalDialogVersionInDraft
                    }
                }
            } = await mutate(gql`
                    mutation {
                        findOrCreateTestPlanReport(input: {
                            testPlanVersionId: ${newModalDialogVersion.id}
                            atId: 3
                            browserId: 3
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

            const newModalDialogVersionTestPlanReportsInDraftCount =
                newModalDialogVersionInDraft.testPlanReports.length;

            // A required report isn't marked as final, VO + Safari
            await expect(() => {
                return updateVersionToPhaseQuery(
                    newModalDialogVersion.id,
                    oldModalDialogVersion.id,
                    'CANDIDATE'
                );
            }).rejects.toThrow(
                /Cannot set phase to candidate because the following required reports have not been collected or finalized:/i
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
            expect(
                oldModalDialogVersionVOSafariCompletedTestsCount
            ).toBeGreaterThan(0);
            expect(newModalDialogVersionTestPlanReportsInRDCount).toBe(0);
            expect(newModalDialogVersionTestPlanReportsInDraftCount).toEqual(1);
        });
    });
});
