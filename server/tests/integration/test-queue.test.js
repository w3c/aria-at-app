const { gql } = require('apollo-server');
const dbCleaner = require('../util/db-cleaner');
const { query, mutate } = require('../util/graphql-test-utilities');
const { sortBy } = require('lodash');
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
                    atVersions {
                        id
                        name
                    }
                }
                browsers {
                    id
                    name
                    browserVersions {
                        id
                        name
                    }
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
                        atVersions: expect.arrayContaining([
                            expect.objectContaining({
                                id: expect.anything(),
                                name: '2020.4'
                            })
                        ])
                    })
                ]),
                browsers: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.anything(),
                        name: 'Firefox',
                        browserVersions: expect.arrayContaining([
                            expect.objectContaining({
                                id: expect.anything(),
                                name: '99.0.1'
                            })
                        ])
                    })
                ]),
                testPlans: expect.arrayContaining([
                    expect.objectContaining({
                        latestTestPlanVersion: expect.objectContaining({
                            id: expect.anything(),
                            title: 'Alert Example'
                        })
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
            const browserId = '1';
            const mutationToTest = async () => {
                const result = await mutate(gql`
                        mutation {
                            findOrCreateTestPlanReport(input: {
                                testPlanVersionId: ${testPlanVersionId}
                                atId: ${atId}
                                browserId: ${browserId}
                            }) {
                                populatedData {
                                    testPlanReport {
                                        id
                                        status
                                        at {
                                            id
                                        }
                                        browser {
                                            id
                                        }
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
                    populatedData: { testPlanReport, testPlanVersion },
                    created
                } = result.findOrCreateTestPlanReport;

                return {
                    testPlanReport,
                    testPlanVersion,
                    created
                };
            };

            // A2
            const first = await mutationToTest();
            const second = await mutationToTest();

            // A3
            expect(first.testPlanReport).toEqual(
                expect.objectContaining({
                    id: expect.anything(),
                    status: 'DRAFT',
                    at: expect.objectContaining({
                        id: atId
                    }),
                    browser: expect.objectContaining({
                        id: browserId
                    })
                })
            );
            expect(first.testPlanVersion).toEqual(
                expect.objectContaining({
                    id: testPlanVersionId
                })
            );
            expect(first.created.length).toBe(1);

            expect(second.testPlanReport).toEqual(
                expect.objectContaining({
                    id: first.testPlanReport.id
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
            const testPlanReportId = '3';
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
                            test {
                                title
                                rowNumber
                            }
                            scenario {
                                commands {
                                    text
                                }
                            }
                            assertion {
                                text
                            }
                        }
                        conflictingResults {
                            testPlanRun {
                                id
                                tester {
                                    username
                                }
                            }
                            scenarioResult {
                                output
                                unexpectedBehaviors {
                                    text
                                    otherUnexpectedBehaviorText
                                }
                            }
                            assertionResult {
                                passed
                                failedReason
                            }
                        }
                    }
                }
            }
        `);

        // Nested sorting turns out to be inconsistent across environments -
        // it might be nice to figure out an elegant way to establish a default
        // sorting scheme for nested models, but this will do for now
        result.testPlanReport.conflicts = result.testPlanReport.conflicts.map(
            conflict => ({
                ...conflict,
                conflictingResults: sortBy(conflict.conflictingResults, ['id'])
            })
        );

        expect(result.testPlanReport).toMatchInlineSnapshot(`
            Object {
              "conflicts": Array [
                Object {
                  "conflictingResults": Array [
                    Object {
                      "assertionResult": Object {
                        "failedReason": null,
                        "passed": true,
                      },
                      "scenarioResult": Object {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": Array [],
                      },
                      "testPlanRun": Object {
                        "id": "2",
                        "tester": Object {
                          "username": "esmeralda-baggins",
                        },
                      },
                    },
                    Object {
                      "assertionResult": Object {
                        "failedReason": "INCORRECT_OUTPUT",
                        "passed": false,
                      },
                      "scenarioResult": Object {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": Array [],
                      },
                      "testPlanRun": Object {
                        "id": "3",
                        "tester": Object {
                          "username": "tom-proudfeet",
                        },
                      },
                    },
                  ],
                  "source": Object {
                    "assertion": Object {
                      "text": "Role 'combobox' is conveyed",
                    },
                    "scenario": Object {
                      "commands": Array [
                        Object {
                          "text": "Shift+Tab",
                        },
                      ],
                    },
                    "test": Object {
                      "rowNumber": 4,
                      "title": "Navigate backwards to a collapsed select-only combobox in interaction mode",
                    },
                  },
                },
                Object {
                  "conflictingResults": Array [
                    Object {
                      "assertionResult": Object {
                        "failedReason": "INCORRECT_OUTPUT",
                        "passed": false,
                      },
                      "scenarioResult": Object {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": Array [],
                      },
                      "testPlanRun": Object {
                        "id": "2",
                        "tester": Object {
                          "username": "esmeralda-baggins",
                        },
                      },
                    },
                    Object {
                      "assertionResult": Object {
                        "failedReason": "NO_OUTPUT",
                        "passed": false,
                      },
                      "scenarioResult": Object {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": Array [],
                      },
                      "testPlanRun": Object {
                        "id": "3",
                        "tester": Object {
                          "username": "tom-proudfeet",
                        },
                      },
                    },
                  ],
                  "source": Object {
                    "assertion": Object {
                      "text": "Role 'combobox' is conveyed",
                    },
                    "scenario": Object {
                      "commands": Array [
                        Object {
                          "text": "Insert+Tab",
                        },
                      ],
                    },
                    "test": Object {
                      "rowNumber": 7,
                      "title": "Read information about a collapsed select-only combobox in reading mode",
                    },
                  },
                },
                Object {
                  "conflictingResults": Array [
                    Object {
                      "assertionResult": null,
                      "scenarioResult": Object {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": Array [],
                      },
                      "testPlanRun": Object {
                        "id": "2",
                        "tester": Object {
                          "username": "esmeralda-baggins",
                        },
                      },
                    },
                    Object {
                      "assertionResult": null,
                      "scenarioResult": Object {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": Array [
                          Object {
                            "otherUnexpectedBehaviorText": "Seeded other unexpected behavior",
                            "text": "Other",
                          },
                        ],
                      },
                      "testPlanRun": Object {
                        "id": "3",
                        "tester": Object {
                          "username": "tom-proudfeet",
                        },
                      },
                    },
                  ],
                  "source": Object {
                    "assertion": null,
                    "scenario": Object {
                      "commands": Array [
                        Object {
                          "text": "Insert+Tab",
                        },
                      ],
                    },
                    "test": Object {
                      "rowNumber": 8,
                      "title": "Read information about a collapsed select-only combobox in interaction mode",
                    },
                  },
                },
                Object {
                  "conflictingResults": Array [
                    Object {
                      "assertionResult": null,
                      "scenarioResult": Object {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": Array [],
                      },
                      "testPlanRun": Object {
                        "id": "2",
                        "tester": Object {
                          "username": "esmeralda-baggins",
                        },
                      },
                    },
                    Object {
                      "assertionResult": null,
                      "scenarioResult": Object {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": Array [
                          Object {
                            "otherUnexpectedBehaviorText": null,
                            "text": "Output is excessively verbose, e.g., includes redundant and/or irrelevant speech",
                          },
                          Object {
                            "otherUnexpectedBehaviorText": "Seeded other unexpected behavior",
                            "text": "Other",
                          },
                        ],
                      },
                      "testPlanRun": Object {
                        "id": "3",
                        "tester": Object {
                          "username": "tom-proudfeet",
                        },
                      },
                    },
                  ],
                  "source": Object {
                    "assertion": null,
                    "scenario": Object {
                      "commands": Array [
                        Object {
                          "text": "Alt+Down",
                        },
                      ],
                    },
                    "test": Object {
                      "rowNumber": 10,
                      "title": "Open a collapsed select-only combobox in reading mode",
                    },
                  },
                },
                Object {
                  "conflictingResults": Array [
                    Object {
                      "assertionResult": Object {
                        "failedReason": "NO_OUTPUT",
                        "passed": false,
                      },
                      "scenarioResult": Object {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": Array [],
                      },
                      "testPlanRun": Object {
                        "id": "2",
                        "tester": Object {
                          "username": "esmeralda-baggins",
                        },
                      },
                    },
                    Object {
                      "assertionResult": Object {
                        "failedReason": "INCORRECT_OUTPUT",
                        "passed": false,
                      },
                      "scenarioResult": Object {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": Array [
                          Object {
                            "otherUnexpectedBehaviorText": null,
                            "text": "Output is excessively verbose, e.g., includes redundant and/or irrelevant speech",
                          },
                          Object {
                            "otherUnexpectedBehaviorText": "Seeded other unexpected behavior",
                            "text": "Other",
                          },
                        ],
                      },
                      "testPlanRun": Object {
                        "id": "3",
                        "tester": Object {
                          "username": "tom-proudfeet",
                        },
                      },
                    },
                  ],
                  "source": Object {
                    "assertion": Object {
                      "text": "State of the combobox (expanded) is conveyed",
                    },
                    "scenario": Object {
                      "commands": Array [
                        Object {
                          "text": "Alt+Down",
                        },
                      ],
                    },
                    "test": Object {
                      "rowNumber": 10,
                      "title": "Open a collapsed select-only combobox in reading mode",
                    },
                  },
                },
              ],
            }
        `);
    });
});
