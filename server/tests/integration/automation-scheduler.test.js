const startSupertestServer = require('../util/api-server');
const automationRoutes = require('../../routes/automation');
const setupMockAutomationSchedulerServer = require('../util/mock-automation-scheduler-server');
const db = require('../../models/index');
const { query } = require('../util/graphql-test-utilities');
const {
    getCollectionJobById
} = require('../../models/services/CollectionJobService');
const {
    markAsFinal,
    unmarkAsFinal
} = require('../../resolvers/TestPlanReportOperations');
const {
    getTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const { deleteTestResult } = require('../../resolvers/TestResultOperations');
const { getTestPlanRuns } = require('../../models/services/TestPlanRunService');
const { getAtVersions } = require('../../models/services/AtService');
const { getBrowserVersions } = require('../../models/services/BrowserService');

let mockAutomationSchedulerServer;
let apiServer;
let sessionAgent;
let transaction;

const jobId = '999';
const testPlanReportId = '1';

beforeAll(async () => {
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

        // clear submitted results from database
        await deleteTestResult(
            { parentContext: { id: testResults[testResults.length - 1].id } },
            null,
            {
                user: {
                    roles: [{ name: 'ADMIN' }]
                }
            }
        );
    });

    it('should validate a job when updating with results that match historical results', async () => {
        const collectionJob = await getCollectionJobById(jobId);

        const testPlanReport = await getTestPlanReportById(
            collectionJob.testPlanRun.testPlanReport.id
        );
        await markAsFinal(
            {
                parentContext: { id: testPlanReport.id }
            },
            null,
            {
                user: {
                    roles: [{ name: 'ADMIN' }]
                }
            }
        );

        // submit historical result to database
        expect(true).toEqual(true);

        const testPlanRunsFromReport = await getTestPlanRuns(null, {
            testPlanReportId: testPlanReport.id
        });

        const mimickedTestResult = testPlanRunsFromReport[0].testResults[0];
        const [atVersions, browserVersions] = await Promise.all([
            getAtVersions(),
            getBrowserVersions()
        ]);

        const atVersion = atVersions.find(
            each => each.id === parseInt(mimickedTestResult.atVersionId)
        );
        const browserVersion = browserVersions.find(
            each => each.id === parseInt(mimickedTestResult.browserVersionId)
        );

        const mimickedResponses = mimickedTestResult.scenarioResults.map(
            scenarioResult => scenarioResult.output
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
            expect(testResult.browserVersion.name).toEqual(browserVersion.name);
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
        await unmarkAsFinal(
            {
                parentContext: { id: testPlanReport.id }
            },
            null,
            {
                user: {
                    roles: [{ name: 'ADMIN' }]
                }
            }
        );
    });

    it('should delete a job', async () => {
        const response = await sessionAgent.post(`/api/jobs/${jobId}/delete`);
        expect(response.statusCode).toBe(200);
        const { collectionJob: storedCollectionJob } =
            await getTestCollectionJob();
        expect(storedCollectionJob).toEqual(null);
    });
});
