const startSupertestServer = require('../util/api-server');
const automationRoutes = require('../../routes/automation');
const setupMockAutomationSchedulerServer = require('../util/mock-automation-scheduler-server');
const db = require('../../models/index');
const { query } = require('../util/graphql-test-utilities');
const {
    getCollectionJobById
} = require('../../models/services/CollectionJobService');
const {
    removeTestPlanRun
} = require('../../models/services/TestPlanRunService');

let mockAutomationSchedulerServer;
let apiServer;
let sessionAgent;
let transaction;

const jobId = '999';
const testPlanReportId = '2';

beforeAll(async () => {
    global.globalTestTransaction = transaction;
    transaction = await db.sequelize.transaction();
    apiServer = await startSupertestServer({
        pathToRoutes: [['/api/jobs', automationRoutes]]
    });
    sessionAgent = apiServer.sessionAgent;
    mockAutomationSchedulerServer = await setupMockAutomationSchedulerServer();
});

afterAll(async () => {
    await transaction.rollback();
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

describe('Schedule jobs with automation controller', () => {
    it('should schedule a new job', async () => {
        const response = await sessionAgent.post('/api/jobs/new').send({
            testPlanReportId
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            id: jobId,
            status: 'QUEUED'
        });
        const { collectionJob: storedCollectionJob } =
            await getTestCollectionJob();
        expect(storedCollectionJob.id).toEqual(jobId);
        expect(storedCollectionJob.status).toEqual('QUEUED');
        expect(storedCollectionJob.testPlanRun.testPlanReport.id).toEqual(
            testPlanReportId
        );
        expect(storedCollectionJob.testPlanRun.testResults.length).toEqual(0);
    });

    it('should cancel a job', async () => {
        const response = await sessionAgent.post(`/api/jobs/${jobId}/cancel`);
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

    it('should restart a job', async () => {
        const response = await sessionAgent.post(`/api/jobs/${jobId}/restart`);
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

    it('should get a job log', async () => {
        const response = await sessionAgent.get(`/api/jobs/${jobId}/log`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            id: jobId,
            log: 'TEST LOG'
        });
    });

    it('should not update a job status without verification', async () => {
        const response = await sessionAgent.post(`/api/jobs/${jobId}/update`);
        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({
            error: 'Unauthorized'
        });
    });

    it('should update a job status with verification', async () => {
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

    it('should update job results', async () => {
        const automatedTestResponse = 'AUTOMATED TEST RESPONSE';
        const collectionJob = await getCollectionJobById(jobId);
        const { at, browser } = collectionJob.testPlanRun.testPlanReport;
        const { tests } =
            collectionJob.testPlanRun.testPlanReport.testPlanVersion;
        const testResultsNumber = collectionJob.testPlanRun.testResults.length;
        const selectedTest = tests[0];
        const numberOfScenarios = selectedTest.scenarios.filter(
            scenario => scenario.atId === at.id
        ).length;
        const response = await sessionAgent
            .post(`/api/jobs/${jobId}/result`)
            .send({
                testId: tests[0].id,
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
            expect(testResult.atVersion.name).toEqual(at.atVersions[0].name);
            expect(testResult.browserVersion.name).toEqual(
                browser.browserVersions[0].name
            );
            testResult.scenarioResults.forEach(scenarioResult => {
                expect(scenarioResult.output).toEqual(automatedTestResponse);
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

    it('should delete a job', async () => {
        const collectionJob = await getCollectionJobById(jobId);
        const { testPlanRun } = collectionJob;
        const response = await sessionAgent.post(`/api/jobs/${jobId}/delete`);
        expect(response.statusCode).toBe(200);
        const { collectionJob: storedCollectionJob } =
            await getTestCollectionJob();
        expect(storedCollectionJob).toEqual(null);
        // Remove test plan run which can exist independent of a collection job
        // to reset the DB
        await removeTestPlanRun(testPlanRun.id);
    });
});
