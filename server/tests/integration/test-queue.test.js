const { gql } = require('apollo-server');
const { dbCleaner } = require('../util/db-cleaner');
const { query, mutate } = require('../util/graphql-test-utilities');

describe('test queue', () => {
    it('displays test plan reports', async () => {
        expect(
            await query(
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
            )
        ).toMatchInlineSnapshot(`
            Object {
              "testPlans": Array [
                Object {
                  "latestVersion": Object {
                    "gitMessage": "Create tests for APG design pattern example: Tri-State Checkbox (#330)",
                    "gitSha": "e7212c4e5c96497cc8a2682e07ee2decd19d3f85",
                    "testCount": 26,
                    "testPlanReports": Array [
                      Object {
                        "conflictCount": 0,
                        "draftTestPlanRuns": Array [
                          Object {
                            "id": "1",
                            "testResultCount": 2,
                            "tester": Object {
                              "username": "foobar-admin",
                            },
                          },
                        ],
                        "id": "1",
                        "status": "DRAFT",
                        "testPlanTarget": Object {
                          "id": "1",
                          "title": "NVDA 2020.4 with Chrome 91.0.4472",
                        },
                      },
                    ],
                    "title": "Checkbox Example (Two State)",
                  },
                },
              ],
            }
        `);
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
            const previousTesterIds =
                previous.testPlanReport.draftTestPlanRuns.map(
                    (testPlanRun) => testPlanRun.tester.id
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
            const previousTesterIds =
                previous.testPlanReport.draftTestPlanRuns.map(
                    (run) => run.tester.id
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
