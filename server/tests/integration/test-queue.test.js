const { gql } = require('apollo-server');
const dbCleaner = require('../util/db-cleaner');
const { query, mutate } = require('../util/graphql-test-utilities');
const db = require('../../models');

afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await db.sequelize.close();
});

describe('test queue', () => {
    it('displays test plan reports', async () => {
        const result = await query(
            gql`
                query {
                    testPlanReports(statuses: [DRAFT, IN_REVIEW]) {
                        id
                        status
                        conflicts {
                            source {
                                test {
                                    id
                                }
                            }
                        }
                        testPlanTarget {
                            id
                            title
                        }
                        testPlanVersion {
                            title
                            gitSha
                            gitMessage
                            tests {
                                id
                            }
                        }
                        draftTestPlanRuns {
                            id
                            tester {
                                username
                            }
                            testResults {
                                id
                            }
                        }
                    }
                }
            `
        );

        expect(result).toEqual({
            testPlanReports: expect.arrayContaining([
                {
                    id: expect.anything(),
                    status: expect.stringMatching(/^(DRAFT|IN_REVIEW)$/),
                    conflicts: expect.any(Array),
                    testPlanTarget: {
                        id: expect.anything(),
                        title: expect.any(String)
                    },
                    testPlanVersion: {
                        title: expect.any(String),
                        gitSha: expect.any(String),
                        gitMessage: expect.any(String),
                        tests: expect.arrayContaining([
                            expect.objectContaining({
                                id: expect.anything()
                            })
                        ])
                    },
                    draftTestPlanRuns: expect.arrayContaining([
                        {
                            id: expect.anything(),
                            tester: expect.objectContaining({
                                username: expect.any(String)
                            }),
                            testResults: expect.arrayContaining([
                                expect.objectContaining({
                                    id: expect.anything()
                                })
                            ])
                        }
                    ])
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
                        assignTester(userId: ${newTesterId}) {
                            testPlanReport {
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
                .testPlanReport
                .draftTestPlanRuns.map(testPlanRun => testPlanRun.tester.id);

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
                        deleteTestPlanRun(userId: ${previousTesterId}) {
                            testPlanReport {
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
                .testPlanReport
                .draftTestPlanRuns.map((run) => run.tester.id);

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
            const testPlanReportId = '3';
            // This report starts in a FINALIZED state. Let's set it to DRAFT.
            await mutate(gql`
                mutation {
                    testPlanReport(id: ${testPlanReportId}) {
                        updateStatus(status: DRAFT) {
                            testPlanReport {
                                status
                            }
                        }
                    }
                }
            `);

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
                            testPlanReport {
                                status
                            }
                        }
                    }
                }
            `);
            const resultStatus =
                result.testPlanReport.updateStatus.testPlanReport.status;

            expect(previousStatus).not.toBe('FINALIZED');
            expect(resultStatus).toBe('FINALIZED');
        });
    });

    it('queries for information needed to add reports', async () => {
        const result = await query(gql`
            query {
                ats {
                    id
                    name
                    atVersions
                }
                browsers {
                    id
                    name
                    browserVersions
                }
                testPlans {
                    latestTestPlanVersion {
                        id
                        title
                    }
                }
            }
        `);

        expect(result).toEqual(
            expect.objectContaining({
                ats: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.anything(),
                        name: 'NVDA',
                        atVersions: expect.arrayContaining(['2020.1'])
                    })
                ]),
                browsers: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.anything(),
                        name: 'Firefox',
                        browserVersions: expect.arrayContaining(['88.0'])
                    })
                ])
            })
        );
    });

    it('supports adding reports', async () => {
        await dbCleaner(async () => {
            // A1
            const testPlanVersionId = '1';
            const atId = '1';
            const unknownAtVersion = '2221.1';
            const browserId = '1';
            const unknownBrowserVersion = '9999.0';
            const mutationToTest = async () => {
                const result = await mutate(gql`
                        mutation {
                            findOrCreateTestPlanReport(input: {
                                testPlanVersionId: ${testPlanVersionId}
                                testPlanTarget: {
                                    atId: ${atId}
                                    atVersion: "${unknownAtVersion}"
                                    browserId: ${browserId}
                                    browserVersion: "${unknownBrowserVersion}"
                                }
                            }) {
                                populatedData {
                                    testPlanReport {
                                        id
                                        status
                                    }
                                    testPlanTarget {
                                        id
                                        at {
                                            id
                                        }
                                        atVersion
                                        browser {
                                            id
                                        }
                                        browserVersion
                                    }
                                    testPlanVersion {
                                        id
                                    }
                                }
                                created {
                                    locationOfData
                                }
                            }
                        }
                    `);
                const {
                    populatedData: {
                        testPlanReport,
                        testPlanTarget,
                        testPlanVersion
                    },
                    created
                } = result.findOrCreateTestPlanReport;
                const createdBrowserVersions = created.filter(
                    ({ locationOfData }) => locationOfData.browserVersion
                );
                const createdAtVersions = created.filter(
                    ({ locationOfData }) => locationOfData.atVersion
                );
                const createdTestPlanTargets = created.filter(
                    ({ locationOfData }) =>
                        locationOfData.testPlanTargetId &&
                        !(
                            locationOfData.browserVersion ||
                            locationOfData.atVersion
                        )
                );
                const createdTestPlanReports = created.filter(
                    ({ locationOfData }) =>
                        locationOfData.testPlanReportId &&
                        !locationOfData.testPlanTargetId
                );
                return {
                    testPlanReport,
                    testPlanTarget,
                    testPlanVersion,
                    created,
                    createdBrowserVersions,
                    createdAtVersions,
                    createdTestPlanTargets,
                    createdTestPlanReports
                };
            };

            // A2
            const first = await mutationToTest();
            const second = await mutationToTest();

            // A3
            expect(first.testPlanReport).toEqual(
                expect.objectContaining({
                    id: expect.anything(),
                    status: 'DRAFT'
                })
            );
            expect(first.testPlanVersion).toEqual(
                expect.objectContaining({
                    id: testPlanVersionId
                })
            );
            expect(first.testPlanTarget).toEqual(
                expect.objectContaining({
                    at: expect.objectContaining({
                        id: atId
                    }),
                    atVersion: unknownAtVersion,
                    browser: expect.objectContaining({
                        id: browserId
                    }),
                    browserVersion: unknownBrowserVersion
                })
            );
            expect(first.created.length).toBe(4);
            expect(first.createdBrowserVersions.length).toBe(1);
            expect(
                first.createdBrowserVersions[0].locationOfData.browserVersion
            ).toBe(unknownBrowserVersion);
            expect(first.createdAtVersions.length).toBe(1);
            expect(first.createdAtVersions[0].locationOfData.atVersion).toBe(
                unknownAtVersion
            );
            expect(first.createdTestPlanTargets.length).toBe(1);
            expect(first.createdTestPlanReports.length).toBe(1);

            expect(second.testPlanReport).toEqual(
                expect.objectContaining({
                    id: first.testPlanReport.id
                })
            );
            expect(second.testPlanTarget).toEqual(
                expect.objectContaining({
                    id: first.testPlanTarget.id
                })
            );
            expect(second.testPlanVersion).toEqual(
                expect.objectContaining({
                    id: first.testPlanVersion.id
                })
            );
            expect(second.created.length).toBe(0);
        });
    });

    it('can be deleted along with associated runs', async () => {
        await dbCleaner(async () => {
            const testPlanReportId = '2';
            const queryBefore = await query(gql`
                query {
                    testPlanReport(id: ${testPlanReportId}) {
                        id
                        draftTestPlanRuns {
                            id
                        }
                    }
                }
            `);
            const { draftTestPlanRuns } = queryBefore.testPlanReport;
            await mutate(gql`
                mutation {
                    testPlanReport(id: ${testPlanReportId}) {
                        deleteTestPlanReport
                    }
                }
            `);
            const queryAfter = await query(gql`
                query {
                    testPlanReport(id: ${testPlanReportId}) {
                        id
                    }
                    testPlanRun(id: ${draftTestPlanRuns[0].id}) {
                        id
                    }
                }
            `);

            expect(queryBefore.testPlanReport.id).toBeTruthy();
            expect(draftTestPlanRuns.length).toBeGreaterThan(0);
            expect(queryAfter.testPlanReport).toBe(null);
            expect(queryAfter.testPlanRun).toBe(null);
        });
    });

    it('displays conflicts', async () => {
        const conflictingReportId = '2';

        const result = await query(gql`
            query {
                testPlanReport(id: ${conflictingReportId}) {
                    conflicts {
                        source {
                            locationOfData
                        }
                        conflictingResults {
                            locationOfData
                        }
                    }
                    conflictsFormatted
                    md: conflictsFormatted(markdown: true)
                }
            }
        `);

        expect(result.testPlanReport).toMatchInlineSnapshot(`
            Object {
              "conflicts": Array [
                Object {
                  "conflictingResults": Array [
                    Object {
                      "locationOfData": Object {
                        "assertionResultId": "ZDhmNeyIxNCI6IlltRXdNZXlJeE15STZJazU2YUd4TlpYbEplRTFwU1RaTmJqQkViR2xQUnlKOVRKaE5UIn0TBjMj",
                      },
                    },
                    Object {
                      "locationOfData": Object {
                        "assertionResultId": "MTIwYeyIxNCI6Ik1qRTVNZXlJeE15STZJbGw2Um1sWlpYbEplRTFwU1RaTk16QlVaR3RPTWlKOWpGbU5tIn0jBmOT",
                      },
                    },
                  ],
                  "source": Object {
                    "locationOfData": Object {
                      "assertionId": "MmEzMeyIzIjoiTmpBeU9leUl5SWpvaU5pSjlHTmhORCJ9jlhMW",
                    },
                  },
                },
                Object {
                  "conflictingResults": Array [
                    Object {
                      "locationOfData": Object {
                        "assertionResultId": "YjA4YeyIxNCI6Ik1UQmtPZXlJeE15STZJbHBYV214TlpYbEplRTFwU1RaTmJqQXlUVEJOVkNKOUdaaU5EIn02UwYm",
                      },
                    },
                    Object {
                      "locationOfData": Object {
                        "assertionResultId": "YTA4MeyIxNCI6IlpUWmxZZXlJeE15STZJazVFV1hsYVpYbEplRTFwU1RaTk16QlhVVEZaYWlKOXpnelpEIn0zdhMG",
                      },
                    },
                  ],
                  "source": Object {
                    "locationOfData": Object {
                      "assertionId": "ODVlNeyIzIjoiTlRnd1pleUl5SWpvaU5pSjlXWTJPVCJ9zgzMj",
                    },
                  },
                },
                Object {
                  "conflictingResults": Array [
                    Object {
                      "locationOfData": Object {
                        "scenarioResultId": "ZWE3MeyIxMyI6IlpqaGtZZXlJeE1pSTZNbjBXUTVNaiJ9WJkYm",
                      },
                    },
                    Object {
                      "locationOfData": Object {
                        "scenarioResultId": "MjRjNeyIxMyI6Ik5UYzNZZXlJeE1pSTZNMzBUVTVObSJ9jkwMm",
                      },
                    },
                  ],
                  "source": Object {
                    "locationOfData": Object {
                      "scenarioId": "OTFhZeyIzIjoiTVRVNE1leUl5SWpvaU5pSjlUTXpabSJ9DM2Ym",
                    },
                  },
                },
              ],
              "conflictsFormatted": "Difference 1 - Testing Shift+Tab for Role 'combobox' is conveyed
            Your result: PASSED: Good Output (for output \\"automatically seeded sample output\\")
            Other result: FAILED: Incorrect Output (for output \\"automatically seeded sample output\\")
            Difference 2 - Testing Insert+Tab for Role 'combobox' is conveyed
            Your result: FAILED: Incorrect Output (for output \\"automatically seeded sample output\\")
            Other result: FAILED: No Output (for output \\"automatically seeded sample output\\")
            Difference 3 - Unexpected behavior when testing Insert+Tab
            Your unexpected behaviors: No unexpected behaviors (for output \\"automatically seeded sample output\\")
            Other unexpected behaviors: Seeded other unexpected behavior (for output \\"automatically seeded sample output\\")
            ",
              "md": "##### Difference 1 - Testing Shift+Tab for Role 'combobox' is conveyed
            * Your result: PASSED: Good Output (for output \\"automatically seeded sample output\\")
            * Other result: FAILED: Incorrect Output (for output \\"automatically seeded sample output\\")
            ##### Difference 2 - Testing Insert+Tab for Role 'combobox' is conveyed
            * Your result: FAILED: Incorrect Output (for output \\"automatically seeded sample output\\")
            * Other result: FAILED: No Output (for output \\"automatically seeded sample output\\")
            ##### Difference 3 - Unexpected behavior when testing Insert+Tab
            * Your unexpected behaviors: No unexpected behaviors (for output \\"automatically seeded sample output\\")
            * Other unexpected behaviors: Seeded other unexpected behavior (for output \\"automatically seeded sample output\\")
            ",
            }
        `);
    });
});
