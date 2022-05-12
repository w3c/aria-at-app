const dbCleaner = require('../util/db-cleaner');
const { query, mutate } = require('../util/graphql-test-utilities');
const db = require('../../models');
const { gql } = require('apollo-server-core');

let testPlanVersionId;
let testPlanReportId;
let testPlanRunId;
let testId;
let testResultId;
let scenarioResultId;
let assertionResultId1;
let assertionResultId2;
let assertionResultId3;

const getTestPlanVersionId = async () => {
    const queryResult = await query(gql`
        query {
            testPlanVersions {
                id
                title
            }
        }
    `);
    testPlanVersionId = queryResult.testPlanVersions.find(
        each => each.title === 'Checkbox Example (Two State)'
    ).id;
};

const prepopulateTestPlanReport = async () => {
    if (!testPlanVersionId) await getTestPlanVersionId();
    const mutationResult = await mutate(gql`
        mutation {
            findOrCreateTestPlanReport(
                input: {
                    testPlanVersionId: ${testPlanVersionId}
                    atId: 1
                    browserId: 1
                }
            ) {
                populatedData {
                    testPlanReport {
                        id
                        runnableTests {
                            id
                        }
                    }
                }
            }
        }
    `);
    const {
        testPlanReport
    } = mutationResult.findOrCreateTestPlanReport.populatedData;
    testPlanReportId = testPlanReport.id;
    testId = testPlanReport.runnableTests[1].id;
};

const prepopulateTestPlanRun = async () => {
    const mutationResult = await mutate(gql`
        mutation {
            testPlanReport(id: ${testPlanReportId}) {
                assignTester(userId: 1) {
                    testPlanRun {
                        id
                    }
                }
            }
        }
    `);
    testPlanRunId = mutationResult.testPlanReport.assignTester.testPlanRun.id;
};

const prepopulateTestResult = async () => {
    const mutationResult = await mutate(gql`
        mutation {
            testPlanRun(id: "${testPlanRunId}") {
                findOrCreateTestResult(testId: "${testId}", atVersionId: 1, browserVersionId: 1) {
                    testResult {
                        id
                        scenarioResults {
                            id
                            assertionResults {
                                id
                            }
                            unexpectedBehaviors {
                                id
                            }
                        }
                    }
                }
            }
        }
    `);
    const testResult =
        mutationResult.testPlanRun.findOrCreateTestResult.testResult;
    testResultId = testResult.id;
    scenarioResultId = testResult.scenarioResults[0].id;
    assertionResultId1 = testResult.scenarioResults[0].assertionResults[0].id;
    assertionResultId2 = testResult.scenarioResults[0].assertionResults[1].id;
    assertionResultId3 = testResult.scenarioResults[0].assertionResults[2].id;
};

describe('testPlanRun', () => {
    afterAll(async () => {
        // Closing the DB connection allows Jest to exit successfully.
        await db.sequelize.close();
    });

    it('creates a testPlanRun', async () => {
        await dbCleaner(async () => {
            await prepopulateTestPlanReport();
            const _userId = '1';

            const mutationResult = await mutate(gql`
                mutation {
                    testPlanReport(id: ${testPlanReportId}) {
                        assignTester(userId: ${_userId}) {
                            testPlanRun {
                                tester {
                                    id
                                }
                            }
                        }
                    }
                }
            `);
            const { testPlanRun } = mutationResult.testPlanReport.assignTester;

            expect(testPlanRun.tester.id).toBe(_userId);
        });
    });

    it('creates a testResult', async () => {
        await dbCleaner(async () => {
            await prepopulateTestPlanReport();
            await prepopulateTestPlanRun();

            const mutationResult = await mutate(gql`
                mutation {
                    testPlanRun(id: "${testPlanRunId}") {
                        findOrCreateTestResult(testId: "${testId}", atVersionId: 1, browserVersionId: 1) {
                            testResult {
                                id
                                test {
                                    id
                                }
                            }
                        }
                    }
                }
            `);
            const {
                testResult
            } = mutationResult.testPlanRun.findOrCreateTestResult;

            expect(testResult.id).toBeTruthy();
            expect(testResult.test.id).toBe(testId);
        });
    });

    it('saves a testResult', async () => {
        await dbCleaner(async () => {
            await prepopulateTestPlanReport();
            await prepopulateTestPlanRun();
            await prepopulateTestResult();

            const mutationResult = await mutate(gql`
                mutation {
                    testResult(id: "${testResultId}") {
                        saveTestResult(
                            input: {
                                id: "${testResultId}"
                                scenarioResults: [
                                    {
                                        id: "${scenarioResultId}"
                                        output: null
                                        assertionResults: [
                                            {
                                                id: "${assertionResultId1}"
                                                passed: true
                                                failedReason: null
                                            }
                                            {
                                                id: "${assertionResultId2}"
                                                passed: null
                                                failedReason: null
                                            }
                                            {
                                                id: "${assertionResultId3}"
                                                passed: null
                                                failedReason: null
                                            }
                                        ]
                                        unexpectedBehaviors: []
                                    }
                                ]
                            }
                        ) {
                            testResult {
                                scenarioResults {
                                    assertionResults {
                                        passed
                                    }
                                }
                            }
                        }
                    }
                }
            `);
            const { testResult } = mutationResult.testResult.saveTestResult;
            const firstPass = testResult.scenarioResults[0].assertionResults[0];

            expect(firstPass.passed).toBe(true);
        });
    });

    it('detects corrupt testResults', async () => {
        await dbCleaner(async () => {
            await prepopulateTestPlanReport();
            await prepopulateTestPlanRun();
            await prepopulateTestResult();

            let error;
            await mutate(gql`
                mutation {
                    testResult(id: "${testResultId}") {
                        saveTestResult(
                            input: {
                                id: "${testResultId}"
                                scenarioResults: [
                                    {
                                        id: "${scenarioResultId}"
                                        output: null
                                        assertionResults: [
                                            {
                                                id: "${assertionResultId1}"
                                                passed: true
                                                failedReason: null
                                            }
                                            {
                                                id: "${assertionResultId2}"
                                                passed: null
                                                failedReason: null
                                            }
                                            {
                                                id: "invalid-id-123" # invalid
                                                passed: null
                                                failedReason: null
                                            }
                                        ]
                                        unexpectedBehaviors: []
                                    }
                                ]
                            }
                        ) {
                            locationOfData
                        }
                    }
                }
            `).catch(err => {
                error = err;
            });
            expect(error.message).toContain(
                'Data was received in an unexpected shape'
            );
        });
    });

    it('submits a testResult', async () => {
        await dbCleaner(async () => {
            await prepopulateTestPlanReport();
            await prepopulateTestPlanRun();
            await prepopulateTestResult();

            const mutationResult = await mutate(gql`
                mutation {
                    testResult(id: "${testResultId}") {
                            submitTestResult(
                                input: {
                                    id: "${testResultId}"
                                    scenarioResults: [
                                        {
                                            id: "${scenarioResultId}"
                                            output: "completed test result"
                                            assertionResults: [
                                                {
                                                    id: "${assertionResultId1}"
                                                    passed: true
                                                    failedReason: null
                                                }
                                                {
                                                    id: "${assertionResultId2}"
                                                    passed: false
                                                    failedReason: NO_OUTPUT
                                                }
                                                {
                                                    id: "${assertionResultId3}"
                                                    passed: false
                                                    failedReason: INCORRECT_OUTPUT
                                                }
                                            ]
                                            unexpectedBehaviors: []
                                        }
                                    ]
                                }
                            ) {
                                testResult {
                                    completedAt
                                }
                            }
                        }
                }
            `);
            const { testResult } = mutationResult.testResult.submitTestResult;

            expect(testResult.completedAt).toBeTruthy();
        });
    });

    it('detects invalid testResult', async () => {
        await dbCleaner(async () => {
            await prepopulateTestPlanReport();
            await prepopulateTestPlanRun();
            await prepopulateTestResult();

            let error;
            await mutate(gql`
                mutation {
                    testResult(id: "${testResultId}") {
                        submitTestResult(
                            input: {
                                id: "${testResultId}"
                                scenarioResults: [
                                    {
                                        id: "${scenarioResultId}"
                                        output: "completed test result"
                                        assertionResults: [
                                            {
                                                id: "${assertionResultId1}"
                                                passed: true
                                                failedReason: null
                                            }
                                            {
                                                id: "${assertionResultId2}"
                                                passed: false
                                                failedReason: NO_OUTPUT
                                            }
                                            {
                                                id: "${assertionResultId3}"
                                                passed: null # invalid
                                                failedReason: INCORRECT_OUTPUT
                                            }
                                        ]
                                        unexpectedBehaviors: []
                                    }
                                ]
                            }
                        ) {
                            locationOfData
                        }
                    }
                }
            `).catch(err => {
                error = err;
            });
            expect(error).toBeTruthy();
        });
    });

    it('deletes a testResult', async () => {
        await dbCleaner(async () => {
            await prepopulateTestPlanReport();
            await prepopulateTestPlanRun();
            await prepopulateTestResult();

            const queryResult = await query(gql`
                query {
                    populateData(locationOfData: {
                        testResultId: "${testResultId}"
                    }) {
                        locationOfData
                        testPlanRun {
                            id
                            testResults {
                                id
                            }
                        }
                    }
                }
            `);
            const mutation = await mutate(gql`
                mutation {
                    testResult(id: "${testResultId}") {
                        deleteTestResult {
                            locationOfData
                            testPlanRun {
                                id
                                testResults {
                                    id
                                }
                            }
                        }
                    }
                }
            `);
            const before = queryResult.populateData.testPlanRun;
            const after = mutation.testResult.deleteTestResult.testPlanRun;
            const beforeId = before.testResults.find(
                testResult => testResult.id === testResultId
            );
            const afterId = after.testResults.find(
                testResult => testResult.id === testResultId
            );

            expect(beforeId).toBeTruthy();
            expect(afterId).not.toBeTruthy();
        });
    });

    it('allows admins to delete all testResults', async () => {
        await dbCleaner(async () => {
            await prepopulateTestPlanReport();
            await prepopulateTestPlanRun();
            await prepopulateTestResult();

            const queryResult = await query(gql`
                query {
                    populateData(locationOfData: {
                        testResultId: "${testResultId}"
                    }) {
                        testPlanRun {
                            testResults {
                                id
                            }
                        }
                    }
                }
            `);
            const mutation = await mutate(gql`
                mutation {
                    testPlanRun(id: ${testPlanRunId}) {
                        deleteTestResults {
                            testPlanRun {
                                id
                                testResults {
                                    id
                                }
                            }
                        }
                    }
                }
            `);
            const before = queryResult.populateData.testPlanRun;
            const after = mutation.testPlanRun.deleteTestResults.testPlanRun;

            expect(before.testResults.length).toBeGreaterThan(0);
            expect(after.testResults.length).toBe(0);
        });
    });
});
