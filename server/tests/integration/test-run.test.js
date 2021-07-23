const { gql } = require('apollo-server');
const dbCleaner = require('../util/db-cleaner');
const { query, mutate } = require('../util/graphql-test-utilities');
const db = require('../../models/index');

afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await db.sequelize.close();
});

describe('test queue', () => {
    it('displays test plan run', async () => {
        const testPlanRunId = 1;

        const result = await query(
            gql`
                query {
                    testPlanRun(id: ${testPlanRunId}) {
                        testResultCount
                        tester {
                            id
                            username
                        }
                        testResults {
                            title
                            index
                            referenceFilePath
                            isComplete
                            isSkipped
                            startedAt
                            completedAt
                            assertions {
                                command
                                priority
                                manualAssertion
                            }
                            assertionCount
                            optionalAssertionCount
                            assertionsPassed
                            optionalAssertionsPassed
                            unexpectedBehaviorCount
                        }
                    }
                }
            `
        );

        expect(result).toEqual(
            expect.objectContaining({
                testPlanRun: expect.objectContaining({
                    testResultCount: expect.any(Number),
                    tester: {
                        id: expect.anything(),
                        username: expect.any(String)
                    },
                    testResults: expect.arrayContaining([
                        expect.objectContaining({
                            title: expect.any(String),
                            index: expect.any(Number),
                            referenceFilePath: expect.any(String),
                            isComplete: expect.any(Boolean),
                            isSkipped: expect.any(Boolean),
                            assertions: expect.arrayContaining([
                                {
                                    command: expect.any(String),
                                    priority: expect.any(String),
                                    manualAssertion: expect.any(String)
                                }
                            ]),
                            assertionCount: expect.any(Number),
                            optionalAssertionCount: expect.any(Number),
                            assertionsPassed: expect.any(Number),
                            optionalAssertionsPassed: expect.any(Number),
                            unexpectedBehaviorCount: expect.any(Number)
                        })
                    ])
                })
            })
        );
    });

    it('updates test plan run serializedForm data', async () => {
        await dbCleaner(async () => {
            const testPlanRunId = 1;
            const testPlanResultIndex = 1;

            const previous = await query(
                gql`
                query {
                    testPlanRun(id: ${testPlanRunId}) {
                        testResultCount
                        tester {
                            id
                            username
                        }
                        testResults {
                            index
                            startedAt
                            rawSerializedFormData
                        }
                    }
                }
            `
            );
            const previousTestResult = previous.testPlanRun.testResults.find(
                testResult => testResult.index === testPlanResultIndex
            );

            const result = await mutate(gql`
                mutation {
                    testPlanRun(id: ${testPlanRunId}) {
                        updateSerializedForm(
                          index: 1
                          form: [{ testing: "something1" }, { testing: "something2" }]
                        ) {
                            testPlanRun {
                                testResultCount
                                tester {
                                    id
                                    username
                                }
                                testResults {
                                    index
                                    startedAt
                                    rawSerializedFormData
                                }
                            }
                        }
                    }
                }
            `);
            const testResult = result.testPlanRun.updateSerializedForm.testPlanRun.testResults.find(
                testResult => testResult.index === testPlanResultIndex
            );

            expect(previousTestResult.startedAt).not.toBeTruthy();
            expect(previousTestResult.rawSerializedFormData).not.toEqual(
                expect.arrayContaining([
                    { testing: 'something1' },
                    { testing: 'something2' }
                ])
            );
            expect(testResult.startedAt).toBeTruthy();
            expect(testResult.rawSerializedFormData).toEqual(
                expect.arrayContaining([
                    { testing: 'something1' },
                    { testing: 'something2' }
                ])
            );
        });
    });

    it('updates test plan run result data', async () => {
        await dbCleaner(async () => {
            const testPlanRunId = 1;
            const testPlanResultIndex = 1;

            // If testResult is submitted, means the user submitted that test's
            // form.
            // Checking to see if testResult is not yet 'complete'
            const previous = await query(
                gql`
                query {
                    testPlanRun(id: ${testPlanRunId}) {
                        testResultCount
                        tester {
                            id
                            username
                        }
                        testResults {
                            index
                            isComplete
                            rawResultData
                        }
                    }
                }
            `
            );
            const previousTestResult = previous.testPlanRun.testResults.find(
                testResult => testResult.index === testPlanResultIndex
            );

            const result = await mutate(gql`
                mutation {
                    testPlanRun(id: ${testPlanRunId}) {
                        updateResult(index: ${testPlanResultIndex}, result: { testing: "something" }) {
                            testPlanRun {
                                testResultCount
                                tester {
                                    id
                                    username
                                }
                                testResults {
                                    index
                                    isComplete
                                    rawResultData
                                }
                            }
                        }
                    }
                }
            `);
            const testResult = result.testPlanRun.updateResult.testPlanRun.testResults.find(
                testResult => testResult.index === testPlanResultIndex
            );

            expect(previousTestResult.isComplete).toEqual(false);
            expect(previousTestResult.rawResultData).not.toHaveProperty(
                'testing'
            );
            expect(testResult.isComplete).toEqual(true);
            expect(testResult.rawResultData).toHaveProperty('testing');
        });
    });
});
