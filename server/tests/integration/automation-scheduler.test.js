const startSupertestServer = require('../util/api-server');
const automationRoutes = require('../../routes/automation');
const setupMockAutomationSchedulerServer = require('../util/mock-automation-scheduler-server');
const db = require('../../models/index');
const { query, mutate } = require('../util/graphql-test-utilities');
const { markAsFinal } = require('../../resolvers/TestPlanReportOperations');
const dbCleaner = require('../util/db-cleaner');
const { default: axios } = require('axios');
const {
    getCollectionJobById
} = require('../../models/services/CollectionJobService');

let mockAutomationSchedulerServer;
let apiServer;
let sessionAgent;

const testPlanReportId = '4';

beforeAll(async () => {
    apiServer = await startSupertestServer({
        pathToRoutes: [['/api/jobs', automationRoutes]]
    });
    sessionAgent = apiServer.sessionAgent;
    mockAutomationSchedulerServer = await setupMockAutomationSchedulerServer();
});

afterAll(async () => {
    await mockAutomationSchedulerServer.tearDown();
    await apiServer.tearDown();
    await db.sequelize.close();
});

const getTestPlanReport = async id =>
    await query(`
        query {
            testPlanReport(id: "${id}") {
                id
                markedFinalAt
                finalizedTestResults {
                    test{
                        id
                    }
                    atVersion{
                        name
                    }
                    browserVersion{
                        name
                    }
                    scenarioResults {
                        id
                        scenario {
                            id
                        }
                        output
                        assertionResults {
                            passed
                            failedReason
                        }
                        unexpectedBehaviors {
                            id
                            otherUnexpectedBehaviorText
                        }
                    }
                }
            }
        }
    `);

const getTestPlanRun = async id =>
    await query(`
        query {
            testPlanRun(id: "${id}") {
                testResults {
                    id
                    test {
                        id
                    }
                    atVersion {
                        id
                        name
                    }
                    browserVersion {
                        id
                        name
                    }
                    scenarioResults {
                        id
                        scenario {
                            id
                        }
                        output
                        assertionResults {
                            passed
                            failedReason
                        }
                        unexpectedBehaviors {
                            id
                            otherUnexpectedBehaviorText
                        }
                    }

                }
            }
        }
    `);

const getTestCollectionJob = async jobId =>
    await query(`
        query {
            collectionJob(id: "${jobId}") {
                id
                status
                externalLogsUrl
                testPlanRun {
                    testPlanReport {
                        id
                        testPlanVersion {
                            id
                            phase
                        }
                    }
                    testResults {
                        id
                        scenarioResults {
                            output
                        }
                    }
                }
            }
        }
    `);

const scheduleCollectionJobByMutation = async () =>
    await mutate(`
        mutation {
            scheduleCollectionJob(testPlanReportId: "${testPlanReportId}") {
                id
                status
                testPlanRun {
                    testPlanReport {
                        id
                        testPlanVersion {
                            id
                            phase
                        }
                    }
                    testResults {
                        id
                        scenarioResults {
                            output
                        }
                    }
                }
            }
        }
    `);

const restartCollectionJobByMutation = async jobId =>
    await mutate(`
        mutation {
            restartCollectionJob(id: "${jobId}") {
                id
                status
            }
        }
    `);

const cancelCollectionJobByMutation = async jobId =>
    await mutate(`
        mutation {
            collectionJob(id: "${jobId}") {
                cancelCollectionJob {
                    id
                    status
                }
            }
        }
    `);

const deleteCollectionJobByMutation = async jobId =>
    await mutate(`
        mutation {
            deleteCollectionJob(id: "${jobId}") 
        }
    `);

describe('Automation controller', () => {
    it('should schedule a new job', async () => {
        await dbCleaner(async () => {
            const job = await scheduleCollectionJobByMutation();
            // get job from result of graphql mutation
            const { scheduleCollectionJob: storedJob } = job;
            expect(storedJob).not.toEqual(undefined);
            expect(storedJob.status).toEqual('QUEUED');
            expect(storedJob.testPlanRun.testPlanReport.id).toEqual(
                testPlanReportId
            );
            expect(storedJob.testPlanRun.testResults.length).toEqual(0);
        });
    });

    it('should schedule a new job and correctly construct test data for automation scheduler', async () => {
        await dbCleaner(async () => {
            const axiosPostMock = jest.spyOn(axios, 'post').mockResolvedValue({
                data: { id: '999', status: 'QUEUED' }
            });

            const {
                testPlanReport: {
                    runnableTests,
                    testPlanVersion: {
                        gitSha: testPlanVersionGitSha,
                        testPlan: { directory: testPlanName }
                    }
                }
            } = await query(`
                query {
                    testPlanReport(id: "${testPlanReportId}") {
                        runnableTests {
                            id
                        }
                        testPlanVersion {
                            testPlan {
                                directory
                            }
                            gitSha
                        }
                    }
                }
            `);

            const testIds = runnableTests.map(({ id }) => id);

            const collectionJob = await scheduleCollectionJobByMutation();

            const expectedRequestBody = {
                testPlanVersionGitSha,
                testIds,
                testPlanName,
                jobId: parseInt(collectionJob.scheduleCollectionJob.id)
            };

            expect(axiosPostMock).toHaveBeenCalledWith(
                `${process.env.AUTOMATION_SCHEDULER_URL}/jobs/new`,
                expectedRequestBody,
                {
                    headers: {
                        'x-automation-secret':
                            process.env.AUTOMATION_SCHEDULER_SECRET
                    },
                    timeout: 1000
                }
            );

            axiosPostMock.mockRestore();
        });
    });

    it('should cancel a job', async () => {
        await dbCleaner(async () => {
            const { scheduleCollectionJob: job } =
                await scheduleCollectionJobByMutation();
            const {
                collectionJob: { cancelCollectionJob: cancelledCollectionJob }
            } = await cancelCollectionJobByMutation(job.id);

            expect(cancelledCollectionJob.status).toEqual('CANCELLED');
            const { collectionJob: storedCollectionJob } =
                await getTestCollectionJob(job.id);
            expect(storedCollectionJob.status).toEqual('CANCELLED');
        });
    });

    it('should gracefully reject request to cancel a job that does not exist', async () => {
        expect.assertions(1); // Make sure an assertion is made
        await expect(cancelCollectionJobByMutation(2)).rejects.toThrow(
            'Could not find collection job with id 2'
        );
    });

    it('should restart a job', async () => {
        await dbCleaner(async () => {
            const { scheduleCollectionJob: job } =
                await scheduleCollectionJobByMutation();
            const { restartCollectionJob: collectionJob } =
                await restartCollectionJobByMutation(job.id);
            expect(collectionJob).not.toBe(undefined);
            expect(collectionJob).toEqual({
                id: job.id,
                status: 'QUEUED'
            });
            const { collectionJob: storedCollectionJob } =
                await getTestCollectionJob(job.id);
            expect(storedCollectionJob.id).toEqual(job.id);
            expect(storedCollectionJob.status).toEqual('QUEUED');
        });
    });

    it('should gracefully reject restarting a job that does not exist', async () => {
        const { restartCollectionJob: res } =
            await restartCollectionJobByMutation('2');
        expect(res).toEqual(null);
    });

    it('should not update a job status without verification', async () => {
        await dbCleaner(async () => {
            const { scheduleCollectionJob: job } =
                await scheduleCollectionJobByMutation();
            const response = await sessionAgent.post(
                `/api/jobs/${job.id}/update`
            );
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                error: 'Unauthorized'
            });
        });
    });

    it('should fail to update a job status with invalid status', async () => {
        await dbCleaner(async () => {
            const { scheduleCollectionJob: job } =
                await scheduleCollectionJobByMutation();
            const response = await sessionAgent
                .post(`/api/jobs/${job.id}/update`)
                .send({ status: 'INVALID' })
                .set(
                    'x-automation-secret',
                    process.env.AUTOMATION_SCHEDULER_SECRET
                );
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                error: 'Invalid status: INVALID'
            });
        });
    });

    it('should fail to update a job status for a non-existent jobId', async () => {
        const response = await sessionAgent
            .post(`/api/jobs/${444}/update`)
            .send({ status: 'RUNNING' })
            .set(
                'x-automation-secret',
                process.env.AUTOMATION_SCHEDULER_SECRET
            );
        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({
            error: `Could not find job with jobId: ${444}`
        });
    });

    it('should update a job status with verification', async () => {
        await dbCleaner(async () => {
            const { scheduleCollectionJob: job } =
                await scheduleCollectionJobByMutation();
            const response = await sessionAgent
                .post(`/api/jobs/${job.id}/update`)
                .send({ status: 'RUNNING' })
                .set(
                    'x-automation-secret',
                    process.env.AUTOMATION_SCHEDULER_SECRET
                );
            const { body } = response;
            expect(response.statusCode).toBe(200);
            expect(body.id).toEqual(parseInt(job.id)); // TODO SOME KIND OF STRING TRANSFORM HAPPENING WHEN POSTED
            expect(body.status).toEqual('RUNNING');
            expect(body).toHaveProperty('testPlanRunId');
            expect(body.testPlanRun.testPlanReportId).toEqual(
                parseInt(testPlanReportId)
            );

            const { collectionJob: storedCollectionJob } =
                await getTestCollectionJob(job.id);
            expect(storedCollectionJob.id).toEqual(job.id);
            expect(storedCollectionJob.status).toEqual('RUNNING');
            expect(storedCollectionJob.externalLogsUrl).toEqual(null);
            expect(storedCollectionJob.testPlanRun.testPlanReport.id).toEqual(
                testPlanReportId
            );
        });
    });

    it('should update a job externalLogsUrl with verification', async () => {
        await dbCleaner(async () => {
            const { scheduleCollectionJob: job } =
                await scheduleCollectionJobByMutation();
            const response = await sessionAgent
                .post(`/api/jobs/${job.id}/update`)
                .send({
                    status: 'CANCELLED',
                    externalLogsUrl: 'https://www.aol.com/'
                })
                .set(
                    'x-automation-secret',
                    process.env.AUTOMATION_SCHEDULER_SECRET
                );
            const { body } = response;
            expect(response.statusCode).toBe(200);
            expect(body.id).toEqual(parseInt(job.id)); // TODO SOME KIND OF STRING TRANSFORM HAPPENING WHEN POSTED
            expect(body.status).toEqual('CANCELLED');
            expect(body).toHaveProperty('testPlanRunId');
            expect(body.testPlanRun.testPlanReportId).toEqual(
                parseInt(testPlanReportId)
            );

            const { collectionJob: storedCollectionJob } =
                await getTestCollectionJob(job.id);
            expect(storedCollectionJob.id).toEqual(job.id);
            expect(storedCollectionJob.status).toEqual('CANCELLED');
            expect(storedCollectionJob.externalLogsUrl).toEqual(
                'https://www.aol.com/'
            );
            expect(storedCollectionJob.testPlanRun.testPlanReport.id).toEqual(
                testPlanReportId
            );
        });
    });

    it('should update job results', async () => {
        await dbCleaner(async () => {
            const { scheduleCollectionJob: job } =
                await scheduleCollectionJobByMutation();
            const collectionJob = await getCollectionJobById(job.id);
            await sessionAgent
                .post(`/api/jobs/${job.id}/update`)
                .send({ status: 'RUNNING' })
                .set(
                    'x-automation-secret',
                    process.env.AUTOMATION_SCHEDULER_SECRET
                );
            const automatedTestResponse = 'AUTOMATED TEST RESPONSE';
            const { at, browser } = collectionJob.testPlanRun.testPlanReport;
            const { tests } =
                collectionJob.testPlanRun.testPlanReport.testPlanVersion;
            const testResultsNumber =
                collectionJob.testPlanRun.testResults.length;
            const selectedTestIndex = 0;
            const selectedTestRowNumber = 1;

            const selectedTest = tests[selectedTestIndex];
            const numberOfScenarios = selectedTest.scenarios.filter(
                scenario => scenario.atId === at.id
            ).length;
            const response = await sessionAgent
                .post(`/api/jobs/${job.id}/result`)
                .send({
                    testCsvRow: selectedTestRowNumber,
                    atVersionName: at.atVersions[0].name,
                    browserVersionName: browser.browserVersions[0].name,
                    responses: new Array(numberOfScenarios).fill(
                        automatedTestResponse
                    )
                })
                .set(
                    'x-automation-secret',
                    process.env.AUTOMATION_SCHEDULER_SECRET
                );
            expect(response.statusCode).toBe(200);
            const storedTestPlanRun = await getTestPlanRun(
                collectionJob.testPlanRun.id
            );

            const { testResults } = storedTestPlanRun.testPlanRun;
            expect(testResults.length).toEqual(testResultsNumber + 1);
            testResults.forEach(testResult => {
                expect(testResult.test.id).toEqual(selectedTest.id);
                expect(testResult.atVersion.name).toEqual(
                    at.atVersions[0].name
                );
                expect(testResult.browserVersion.name).toEqual(
                    browser.browserVersions[0].name
                );
                testResult.scenarioResults.forEach(scenarioResult => {
                    expect(scenarioResult.output).toEqual(
                        automatedTestResponse
                    );
                    scenarioResult.assertionResults.forEach(assertionResult => {
                        expect(assertionResult.passed).toEqual(false);
                        expect(assertionResult.failedReason).toEqual(
                            'AUTOMATED_OUTPUT'
                        );
                    });
                    scenarioResult.unexpectedBehaviors?.forEach(
                        unexpectedBehavior => {
                            expect(unexpectedBehavior.id).toEqual('OTHER');
                            expect(
                                unexpectedBehavior.otherUnexpectedBehaviorText
                            ).toEqual(null);
                        }
                    );
                });
            });
        });
    });

    it('should copy assertion results when updating with results that match historical results', async () => {
        await dbCleaner(async () => {
            // Start by getting historical results for comparing later
            // Test plan report used for test is in Draft so it
            // must be markedAsFinal to have historical results
            const finalizedTestPlanVersion = await markAsFinal(
                {
                    parentContext: { id: testPlanReportId }
                },
                null,
                {
                    user: {
                        roles: [{ name: 'ADMIN' }]
                    }
                }
            );

            const { testPlanReport } = await getTestPlanReport(
                finalizedTestPlanVersion.testPlanReport.id
            );
            const selectedTestIndex = 0;
            const selectedTestRowNumber = 1;

            const historicalTestResult =
                testPlanReport.finalizedTestResults[selectedTestIndex];
            expect(historicalTestResult).not.toEqual(undefined);
            const historicalResponses =
                historicalTestResult?.scenarioResults.map(
                    scenarioResult => scenarioResult.output
                );
            const { atVersion, browserVersion } = historicalTestResult;

            const { scheduleCollectionJob: job } =
                await scheduleCollectionJobByMutation();
            const collectionJob = await getCollectionJobById(job.id);
            await sessionAgent
                .post(`/api/jobs/${job.id}/update`)
                .send({ status: 'RUNNING' })
                .set(
                    'x-automation-secret',
                    process.env.AUTOMATION_SCHEDULER_SECRET
                );

            const response = await sessionAgent
                .post(`/api/jobs/${job.id}/result`)
                .send({
                    testCsvRow: selectedTestRowNumber,
                    atVersionName: atVersion.name,
                    browserVersionName: browserVersion.name,
                    responses: historicalResponses
                })
                .set(
                    'x-automation-secret',
                    process.env.AUTOMATION_SCHEDULER_SECRET
                );
            expect(response.statusCode).toBe(200);

            const storedTestPlanRun = await getTestPlanRun(
                collectionJob.testPlanRun.id
            );

            const { testResults } = storedTestPlanRun.testPlanRun;

            testResults.forEach(testResult => {
                expect(testResult.test.id).toEqual(
                    historicalTestResult.test.id
                );
                expect(testResult.atVersion.name).toEqual(atVersion.name);
                expect(testResult.browserVersion.name).toEqual(
                    browserVersion.name
                );
                testResult.scenarioResults.forEach((scenarioResult, index) => {
                    const historicalScenarioResult =
                        historicalTestResult.scenarioResults[index];
                    expect(scenarioResult.output).toEqual(
                        historicalScenarioResult.output
                    );

                    scenarioResult.assertionResults.forEach(
                        (assertionResult, index) => {
                            const historicalAssertionResult =
                                historicalScenarioResult.assertionResults[
                                    index
                                ];
                            expect(assertionResult.passed).toEqual(
                                historicalAssertionResult.passed
                            );
                            expect(assertionResult.failedReason).toEqual(
                                historicalAssertionResult.failedReason
                            );
                        }
                    );
                    scenarioResult.unexpectedBehaviors?.forEach(
                        (unexpectedBehavior, index) => {
                            expect(unexpectedBehavior.id).toEqual(
                                historicalScenarioResult.unexpectedBehaviors[
                                    index
                                ].id
                            );
                            expect(
                                unexpectedBehavior.otherUnexpectedBehaviorText
                            ).toEqual(
                                historicalScenarioResult.unexpectedBehaviors[
                                    index
                                ].otherUnexpectedBehaviorText
                            );
                        }
                    );
                });
            });
        });
    });

    it('should delete a job', async () => {
        await dbCleaner(async () => {
            const { scheduleCollectionJob: job } =
                await scheduleCollectionJobByMutation();
            const { collectionJob: storedCollectionJob } =
                await getTestCollectionJob(job.id);
            expect(storedCollectionJob.id).toEqual(job.id);

            const res = await deleteCollectionJobByMutation(job.id);
            expect(res).toEqual({
                deleteCollectionJob: true
            });

            const { collectionJob: deletedCollectionJob } =
                await getTestCollectionJob(job.id);
            expect(deletedCollectionJob).toEqual(null);
        });
    });
});
