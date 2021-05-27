const { gql } = require('apollo-server');
const { dbCleaner } = require('../util/db-cleaner');
const { query, mutate } = require('../util/graphql-test-utilities');

describe('test queue', () => {
    it('displays test plan reports', async () => {
        const result = await query(
            gql`
                query {
                    testPlans {
                        latestVersion {
                            title
                            gitSha
                            gitMessage
                            testCount
                            testPlanReports {
                                id
                                status
                                conflictCount
                                testPlanTarget {
                                    id
                                    title
                                }
                                draftTestPlanRuns {
                                    id
                                    tester {
                                        username
                                    }
                                    testResultCount
                                }
                            }
                        }
                    }
                }
            `
        );

        expect(result).toEqual({
            testPlans: expect.arrayContaining([
                {
                    latestVersion: {
                        gitSha: expect.any(String),
                        gitMessage: expect.any(String),
                        title: expect.any(String),
                        testCount: expect.any(Number),
                        testPlanReports: expect.arrayContaining([
                            {
                                id: expect.anything(),
                                status: expect.stringMatching(
                                    /^(DRAFT|IN_REVIEW|FINALIZED)$/
                                ),
                                conflictCount: expect.any(Number),
                                testPlanTarget: {
                                    id: expect.anything(),
                                    title: expect.any(String)
                                },
                                draftTestPlanRuns: [
                                    {
                                        id: expect.anything(),
                                        testResultCount: expect.any(Number),
                                        tester: expect.objectContaining({
                                            username: expect.any(String)
                                        })
                                    }
                                ]
                            }
                        ])
                    }
                }
            ])
        });
    });

    it('assigns testers to a test plan report', async () => {
        await dbCleaner(async () => {
            // A1
            const testReportId = '1';
            const newTesterId = '2';
            const previous = await query(gql`
                query {
                    testPlanReport(id: ${testReportId}) {
                        draftTestPlanRuns {
                            tester {
                                id
                            }
                        }
                    }
                }
            `);
            const previousTesterIds = previous.testPlanReport.draftTestPlanRuns.map(
                testPlanRun => testPlanRun.tester.id
            );

            // A2
            const result = await mutate(gql`
                mutation {
                    testPlanReport(id: ${testReportId}) {
                        assignTester(user: ${newTesterId}) {
                            resultingTestPlanReport {
                                draftTestPlanRuns {
                                    tester {
                                        id
                                        username
                                    }
                                }
                            }
                        }
                    }
                }
            `);

            // prettier-ignore
            const resultTesterIds = result
                .testPlanReport
                .assignTester
                .resultingTestPlanReport
                .draftTestPlanRuns.map(
                    (testPlanRun) => testPlanRun.tester.id
                );

            // A3
            expect(previousTesterIds).not.toEqual(
                expect.arrayContaining([newTesterId])
            );
            expect(resultTesterIds).toEqual(
                expect.arrayContaining([newTesterId])
            );
        });
    });

    it('removes testers from a test plan report', async () => {
        await dbCleaner(async () => {
            // A1
            const testPlanReportId = '1';
            const previousTesterId = '1';
            const previous = await query(gql`
                query {
                    testPlanReport(id: ${testPlanReportId}) {
                        draftTestPlanRuns {
                            tester {
                                id
                            }
                        }
                    }
                }
            `);
            const previousTesterIds = previous.testPlanReport.draftTestPlanRuns.map(
                run => run.tester.id
            );

            // A2
            const result = await mutate(gql`
                mutation {
                    testPlanReport(id: ${testPlanReportId}) {
                        deleteTestPlanRun(user: ${previousTesterId}) {
                            resultingTestPlanReport {
                                draftTestPlanRuns {
                                    tester {
                                        username
                                    }
                                }
                            }
                        }
                    }
                }
            `);

            // prettier-ignore
            const resultTesterIds = result
                .testPlanReport
                .deleteTestPlanRun
                .resultingTestPlanReport
                .draftTestPlanRuns.map(
                    (run) => run.tester.id
                );

            // A3
            expect(previousTesterIds).toEqual(
                expect.arrayContaining([previousTesterId])
            );
            expect(resultTesterIds).not.toEqual(
                expect.arrayContaining([previousTesterId])
            );
        });
    });

    it('can be finalized', async () => {
        await dbCleaner(async () => {
            const testPlanReportId = '1';
            const previous = await query(gql`
                query {
                    testPlanReport(id: ${testPlanReportId}) {
                        status
                    }
                }
            `);
            const previousStatus = previous.testPlanReport.status;

            const result = await mutate(gql`
                mutation {
                    testPlanReport(id: ${testPlanReportId}) {
                        updateStatus(status: FINALIZED) {
                            resultingTestPlanReport {
                                status
                            }
                        }
                    }
                }
            `);
            const resultStatus =
                result.testPlanReport.updateStatus.resultingTestPlanReport
                    .status;

            expect(previousStatus).not.toBe('FINALIZED');
            expect(resultStatus).toBe('FINALIZED');
        });
    });
});
