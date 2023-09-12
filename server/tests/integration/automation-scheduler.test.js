const startSupertestServer = require('../util/api-server');
const automationRoutes = require('../../routes/automation');
const setupMockAutomationSchedulerServer = require('../util/mock-automation-scheduler-server');
const db = require('../../models/index');
const { query } = require('../util/graphql-test-utilities');
const { markAsFinal } = require('../../resolvers/TestPlanReportOperations');
const { getTestPlanRuns } = require('../../models/services/TestPlanRunService');
const { getAtVersions } = require('../../models/services/AtService');
const { getBrowserVersions } = require('../../models/services/BrowserService');
const dbCleaner = require('../util/db-cleaner');

let mockAutomationSchedulerServer;
let apiServer;
let sessionAgent;

const jobId = '999';
const testPlanReportId = '1';

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

const getTestCollectionJob = async () =>
    await query(`
        query {
            collectionJob(id: "${jobId}") {
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

const createCollectionJob = async () =>
    await sessionAgent.post('/api/jobs/new').send({
        testPlanReportId
    });

describe('Schedule jobs with automation controller', () => {
    it('should schedule a new job', async () => {
        await dbCleaner(async () => {
            const response = await createCollectionJob();

            expect(response.statusCode).toBe(200);
            expect(response.body.id).toEqual(jobId);
            expect(response.body.status).toEqual('QUEUED');
            const { collectionJob: storedCollectionJob } =
                await getTestCollectionJob();
            expect(storedCollectionJob.id).toEqual(jobId);
            expect(storedCollectionJob.status).toEqual('QUEUED');
            expect(storedCollectionJob.testPlanRun.testPlanReport.id).toEqual(
                testPlanReportId
            );
            expect(storedCollectionJob.testPlanRun.testResults.length).toEqual(
                0
            );
        });
    });

    it('should cancel a job', async () => {
        await dbCleaner(async () => {
            await createCollectionJob();
            const response = await sessionAgent.post(
                `/api/jobs/${jobId}/cancel`
            );
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                id: jobId,
                status: 'CANCELED'
            });
            const { collectionJob: storedCollectionJob } =
                await getTestCollectionJob();
            expect(storedCollectionJob.id).toEqual(jobId);
            expect(storedCollectionJob.status).toEqual('CANCELED');
        });
    });

    it('should restart a job', async () => {
        await dbCleaner(async () => {
            await createCollectionJob();
            const response = await sessionAgent.post(
                `/api/jobs/${jobId}/restart`
            );
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                id: jobId,
                status: 'QUEUED'
            });
            const { collectionJob: storedCollectionJob } =
                await getTestCollectionJob();
            expect(storedCollectionJob.id).toEqual(jobId);
            expect(storedCollectionJob.status).toEqual('QUEUED');
        });
    });

    it('should get a job log', async () => {
        await dbCleaner(async () => {
            await createCollectionJob();
            const response = await sessionAgent.get(`/api/jobs/${jobId}/log`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                id: jobId,
                log: 'TEST LOG'
            });
        });
    });

    it('should not update a job status without verification', async () => {
        await dbCleaner(async () => {
            await createCollectionJob();
            const response = await sessionAgent.post(
                `/api/jobs/${jobId}/update`
            );
            expect(response.statusCode).toBe(403);
            expect(response.body).toEqual({
                error: 'Unauthorized'
            });
        });
    });

    it('should update a job status with verification', async () => {
        await dbCleaner(async () => {
            await createCollectionJob();
            const response = await sessionAgent
                .post(`/api/jobs/${jobId}/update`)
                .send({ status: 'RUNNING' })
                .set(
                    'x-automation-secret',
                    process.env.AUTOMATION_SCHEDULER_SECRET
                );
            const { body } = response;
            expect(response.statusCode).toBe(200);
            expect(body.id).toEqual(jobId);
            expect(body.status).toEqual('RUNNING');
            expect(body).toHaveProperty('testPlanRunId');
            expect(body.testPlanRun.testPlanReportId).toEqual(
                parseInt(testPlanReportId)
            );

            const { collectionJob: storedCollectionJob } =
                await getTestCollectionJob();
            expect(storedCollectionJob.id).toEqual(jobId);
            expect(storedCollectionJob.status).toEqual('RUNNING');
            expect(storedCollectionJob.testPlanRun.testPlanReport.id).toEqual(
                testPlanReportId
            );
        });
    });

    it('should update job results', async () => {
        await dbCleaner(async () => {
            const res = await createCollectionJob();
            const collectionJob = res.body;
            await sessionAgent
                .post(`/api/jobs/${jobId}/update`)
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
            const selectedTest = tests[0];
            const numberOfScenarios = selectedTest.scenarios.filter(
                scenario => scenario.atId === at.id
            ).length;
            const response = await sessionAgent
                .post(`/api/jobs/${jobId}/result`)
                .send({
                    testId: selectedTest.id,
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
                    scenarioResult.unexpectedBehaviors.forEach(
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

    it('should validate a job when updating with results that match historical results', async () => {
        await dbCleaner(async () => {
            const res = await createCollectionJob();
            const collectionJob = res.body;
            await sessionAgent
                .post(`/api/jobs/${jobId}/update`)
                .send({ status: 'RUNNING' })
                .set(
                    'x-automation-secret',
                    process.env.AUTOMATION_SCHEDULER_SECRET
                );
            await markAsFinal(
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

            const testPlanRunsFromReport = await getTestPlanRuns(null, {
                testPlanReportId: testPlanReportId
            });
            const mimickedTestResult = testPlanRunsFromReport[0].testResults[0];
            const mimickedResponses = mimickedTestResult?.scenarioResults.map(
                scenarioResult => scenarioResult.output
            );

            const [atVersions, browserVersions] = await Promise.all([
                getAtVersions(),
                getBrowserVersions()
            ]);
            const atVersion = atVersions.find(
                each => each.id === parseInt(mimickedTestResult?.atVersionId)
            );
            const browserVersion = browserVersions.find(
                each =>
                    each.id === parseInt(mimickedTestResult?.browserVersionId)
            );

            const response = await sessionAgent
                .post(`/api/jobs/${jobId}/result`)
                .send({
                    testId: mimickedTestResult.testId,
                    atVersionName: atVersion.name,
                    browserVersionName: browserVersion.name,
                    responses: mimickedResponses
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
                expect(testResult.test.id).toEqual(mimickedTestResult.testId);
                expect(testResult.atVersion.name).toEqual(atVersion.name);
                expect(testResult.browserVersion.name).toEqual(
                    browserVersion.name
                );
                testResult.scenarioResults.forEach((scenarioResult, index) => {
                    const mimickedScenarioResult =
                        mimickedTestResult.scenarioResults[index];
                    expect(scenarioResult.output).toEqual(
                        mimickedScenarioResult.output
                    );
                    scenarioResult.assertionResults.forEach(
                        (assertionResult, index) => {
                            const mimickedAssertionResult =
                                mimickedScenarioResult.assertionResults[index];
                            expect(assertionResult.passed).toEqual(
                                mimickedAssertionResult.passed
                            );
                            expect(assertionResult.failedReason).toEqual(
                                mimickedAssertionResult.failedReason
                            );
                        }
                    );
                    scenarioResult.unexpectedBehaviors.forEach(
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

    it('should delete a job', async () => {
        await dbCleaner(async () => {
            await createCollectionJob();
            const { collectionJob: storedCollectionJob } =
                await getTestCollectionJob();
            expect(storedCollectionJob.id).toEqual(jobId);
            const response = await sessionAgent.post(
                `/api/jobs/${jobId}/delete`
            );
            expect(response.statusCode).toBe(200);
            const { collectionJob: deletedCollectionJob } =
                await getTestCollectionJob();
            expect(deletedCollectionJob).toEqual(null);
        });
    });
});
