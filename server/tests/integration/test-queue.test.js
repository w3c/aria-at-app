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
                    testPlanReports(phases: [DRAFT]) {
                        id
                        conflicts {
                            source {
                                test {
                                    id
                                }
                            }
                        }
                        testPlanVersion {
                            title
                            phase
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
                    conflicts: expect.any(Array),
                    testPlanVersion: {
                        title: expect.any(String),
                        phase: expect.any(String),
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
            const previousTesterIds =
                previous.testPlanReport.draftTestPlanRuns.map(
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
            const previousTesterIds =
                previous.testPlanReport.draftTestPlanRuns.map(
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
                    }
                }
            `);
            const previousPhase = previous.testPlanVersion.phase;

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
                    id: testPlanVersionId,
                    phase: 'DRAFT'
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
            const testPlanReportId = '4';
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
                conflictingResults: sortBy(conflict.conflictingResults, [
                    'testPlanRun.id'
                ])
            })
        );

        expect(result.testPlanReport).toMatchInlineSnapshot(`
            {
              "conflicts": [
                {
                  "conflictingResults": [
                    {
                      "assertionResult": {
                        "failedReason": null,
                        "passed": true,
                      },
                      "scenarioResult": {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": [],
                      },
                      "testPlanRun": {
                        "id": "2",
                        "tester": {
                          "username": "esmeralda-baggins",
                        },
                      },
                    },
                    {
                      "assertionResult": {
                        "failedReason": "INCORRECT_OUTPUT",
                        "passed": false,
                      },
                      "scenarioResult": {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": [],
                      },
                      "testPlanRun": {
                        "id": "3",
                        "tester": {
                          "username": "tom-proudfeet",
                        },
                      },
                    },
                  ],
                  "source": {
                    "assertion": {
                      "text": "Role 'combobox' is conveyed",
                    },
                    "scenario": {
                      "commands": [
                        {
                          "text": "Shift+Tab",
                        },
                      ],
                    },
                    "test": {
                      "rowNumber": 4,
                      "title": "Navigate backwards to a collapsed select-only combobox in interaction mode",
                    },
                  },
                },
                {
                  "conflictingResults": [
                    {
                      "assertionResult": {
                        "failedReason": "INCORRECT_OUTPUT",
                        "passed": false,
                      },
                      "scenarioResult": {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": [],
                      },
                      "testPlanRun": {
                        "id": "2",
                        "tester": {
                          "username": "esmeralda-baggins",
                        },
                      },
                    },
                    {
                      "assertionResult": {
                        "failedReason": "NO_OUTPUT",
                        "passed": false,
                      },
                      "scenarioResult": {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": [],
                      },
                      "testPlanRun": {
                        "id": "3",
                        "tester": {
                          "username": "tom-proudfeet",
                        },
                      },
                    },
                  ],
                  "source": {
                    "assertion": {
                      "text": "Role 'combobox' is conveyed",
                    },
                    "scenario": {
                      "commands": [
                        {
                          "text": "Insert+Tab",
                        },
                      ],
                    },
                    "test": {
                      "rowNumber": 7,
                      "title": "Read information about a collapsed select-only combobox in reading mode",
                    },
                  },
                },
                {
                  "conflictingResults": [
                    {
                      "assertionResult": null,
                      "scenarioResult": {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": [],
                      },
                      "testPlanRun": {
                        "id": "2",
                        "tester": {
                          "username": "esmeralda-baggins",
                        },
                      },
                    },
                    {
                      "assertionResult": null,
                      "scenarioResult": {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": [
                          {
                            "otherUnexpectedBehaviorText": "Seeded other unexpected behavior",
                            "text": "Other",
                          },
                        ],
                      },
                      "testPlanRun": {
                        "id": "3",
                        "tester": {
                          "username": "tom-proudfeet",
                        },
                      },
                    },
                  ],
                  "source": {
                    "assertion": null,
                    "scenario": {
                      "commands": [
                        {
                          "text": "Insert+Tab",
                        },
                      ],
                    },
                    "test": {
                      "rowNumber": 8,
                      "title": "Read information about a collapsed select-only combobox in interaction mode",
                    },
                  },
                },
                {
                  "conflictingResults": [
                    {
                      "assertionResult": null,
                      "scenarioResult": {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": [],
                      },
                      "testPlanRun": {
                        "id": "2",
                        "tester": {
                          "username": "esmeralda-baggins",
                        },
                      },
                    },
                    {
                      "assertionResult": null,
                      "scenarioResult": {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": [
                          {
                            "otherUnexpectedBehaviorText": null,
                            "text": "Output is excessively verbose, e.g., includes redundant and/or irrelevant speech",
                          },
                          {
                            "otherUnexpectedBehaviorText": "Seeded other unexpected behavior",
                            "text": "Other",
                          },
                        ],
                      },
                      "testPlanRun": {
                        "id": "3",
                        "tester": {
                          "username": "tom-proudfeet",
                        },
                      },
                    },
                  ],
                  "source": {
                    "assertion": null,
                    "scenario": {
                      "commands": [
                        {
                          "text": "Alt+Down",
                        },
                      ],
                    },
                    "test": {
                      "rowNumber": 10,
                      "title": "Open a collapsed select-only combobox in reading mode",
                    },
                  },
                },
                {
                  "conflictingResults": [
                    {
                      "assertionResult": {
                        "failedReason": "NO_OUTPUT",
                        "passed": false,
                      },
                      "scenarioResult": {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": [],
                      },
                      "testPlanRun": {
                        "id": "2",
                        "tester": {
                          "username": "esmeralda-baggins",
                        },
                      },
                    },
                    {
                      "assertionResult": {
                        "failedReason": "INCORRECT_OUTPUT",
                        "passed": false,
                      },
                      "scenarioResult": {
                        "output": "automatically seeded sample output",
                        "unexpectedBehaviors": [
                          {
                            "otherUnexpectedBehaviorText": null,
                            "text": "Output is excessively verbose, e.g., includes redundant and/or irrelevant speech",
                          },
                          {
                            "otherUnexpectedBehaviorText": "Seeded other unexpected behavior",
                            "text": "Other",
                          },
                        ],
                      },
                      "testPlanRun": {
                        "id": "3",
                        "tester": {
                          "username": "tom-proudfeet",
                        },
                      },
                    },
                  ],
                  "source": {
                    "assertion": {
                      "text": "State of the combobox (expanded) is conveyed",
                    },
                    "scenario": {
                      "commands": [
                        {
                          "text": "Alt+Down",
                        },
                      ],
                    },
                    "test": {
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
