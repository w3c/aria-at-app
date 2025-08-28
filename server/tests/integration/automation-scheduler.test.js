const startSupertestServer = require('../util/api-server');
const automationRoutes = require('../../routes/automation');
const {
  setupMockAutomationSchedulerServer,
  startCollectionJobSimulation
} = require('../util/mock-automation-scheduler-server');
const db = require('../../models/index');
const { query, mutate } = require('../util/graphql-test-utilities');
const dbCleaner = require('../util/db-cleaner');
const {
  getCollectionJobById
} = require('../../models/services/CollectionJobService');
const markAsFinalResolver = require('../../resolvers/TestPlanReportOperations/markAsFinalResolver');
const AtLoader = require('../../models/loaders/AtLoader');
const BrowserLoader = require('../../models/loaders/BrowserLoader');
const getGraphQLContext = require('../../graphql-context');
const { COLLECTION_JOB_STATUS } = require('../../util/enums');
const {
  getAtVersionByQuery
} = require('../../models/services/AtVersionService');
const { getAtById } = require('../../models/services/AtService');

let apiServer;
let sessionAgent;

const testPlanReportId = '18';

beforeAll(async () => {
  apiServer = await startSupertestServer({
    pathToRoutes: [['/api/jobs', automationRoutes]]
  });
  sessionAgent = apiServer.sessionAgent;
  await setupMockAutomationSchedulerServer();
});

afterAll(async () => {
  await apiServer.tearDown();
  await db.sequelize.close();
});

const getTestPlanReport = async (id, { transaction }) =>
  await query(
    `
            query {
                testPlanReport(id: "${id}") {
                    id
                    markedFinalAt
                    testPlanVersion {
                        id
                        phase
                    }
                    at { 
                        name 
                        atVersions {
                            id
                            name
                        }
                    }
                    browser { 
                        name 
                        browserVersions {
                            id
                            name
                        }
                    }
                    exactAtVersion {
                        id
                        name
                    }
                    finalizedTestResults {
                        test {
                            id
                            rowNumber
                        }
                        atVersion {
                            name
                        }
                        browserVersion {
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
                            negativeSideEffects {
                                id
                                details
                            }
                        }
                    }
                }
            }
        `,
    { transaction }
  );

const getTestPlanRun = async (id, { transaction }) =>
  await query(
    `
            query {
                testPlanRun(id: "${id}") {
                    testResults {
                        id
                        test {
                            id
                            rowNumber
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
                            negativeSideEffects {
                                id
                                details
                            }
                        }

                    }
                }
            }
        `,
    { transaction }
  );

const getTestCollectionJob = async (jobId, { transaction }) =>
  await query(
    `
            query {
                collectionJob(id: "${jobId}") {
                    id
                    status
                    externalLogsUrl
                    testPlanRun {
                      id
                        testPlanReport {
                            id
                            exactAtVersion {
                                id
                                name
                            }
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
                    testStatus {
                        test { id }
                        status
                    }
                }
            }
        `,
    { transaction }
  );

const scheduleCollectionJobByMutation = async ({
  transaction,
  reportId = testPlanReportId
}) =>
  await mutate(
    `
            mutation {
                scheduleCollectionJob(testPlanReportId: "${reportId}") {
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
                    testStatus {
                        test { id }
                        status
                    }
                }
            }
        `,
    { transaction }
  );

const restartCollectionJobByMutation = async (jobId, { transaction }) =>
  await mutate(
    `
            mutation {
                restartCollectionJob(id: "${jobId}") {
                    id
                    status
                }
            }
        `,
    { transaction }
  );

const retryCanceledCollectionJobByMutation = async (jobId, { transaction }) =>
  await mutate(
    `
  mutation {
    collectionJob(id: "${jobId}") {
      retryCanceledCollections {
        id
        status
        testStatus {
          status
        }
      }
    }
  }  `,
    { transaction }
  );
const cancelCollectionJobByMutation = async (jobId, { transaction }) =>
  await mutate(
    `
            mutation {
                collectionJob(id: "${jobId}") {
                    cancelCollectionJob {
                        id
                        status
                    }
                }
            }
        `,
    { transaction }
  );

const deleteCollectionJobByMutation = async (jobId, { transaction }) =>
  await mutate(
    `
            mutation {
                deleteCollectionJob(id: "${jobId}")
            }
        `,
    { transaction }
  );

const createCollectionJobsFromPreviousVersionMutation = async (
  atVersionId,
  { transaction }
) =>
  await mutate(
    `
            mutation {
                createCollectionJobsFromPreviousAtVersion(atVersionId: "${atVersionId}") {
                    collectionJobs {
                        id
                        status
                        testStatus {
                            status
                        }
                        testPlanRun {
                            tester {
                                isBot
                            }
                            testPlanReport {
                                id
                                markedFinalAt
                                at {
                                    id
                                    name
                                }
                                exactAtVersion {
                                    id
                                    name
                                }
                                testPlanVersion {
                                    id
                                    title
                                }
                            }
                        }
                    }
                    message
                }
            }
        `,
    { transaction }
  );

const getJobSecret = async (jobId, { transaction }) => {
  const job = await getCollectionJobById({ id: jobId, transaction });
  return job.secret;
};

describe('Automation controller', () => {
  it('should schedule a new job', async () => {
    await dbCleaner(async transaction => {
      const job = await scheduleCollectionJobByMutation({ transaction });
      // get job from result of graphql mutation
      const { scheduleCollectionJob: storedJob } = job;
      expect(storedJob).not.toEqual(undefined);
      expect(storedJob.status).toEqual('QUEUED');
      expect(storedJob.testPlanRun.testPlanReport.id).toEqual(testPlanReportId);
      expect(storedJob.testPlanRun.testResults.length).toEqual(0);
      const collectionJob = await getCollectionJobById({
        id: storedJob.id,
        transaction
      });
      const tests =
        collectionJob.testPlanRun.testPlanReport.testPlanVersion.tests.filter(
          test => test.at.key === 'voiceover_macos'
        );
      // check testIds - order doesn't matter, so we sort them
      expect(
        startCollectionJobSimulation.lastCallParams.testIds.sort()
      ).toEqual(tests.map(test => test.id).sort());
    });
  });

  it('should cancel a job and all remaining tests', async () => {
    await dbCleaner(async transaction => {
      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({ transaction });
      const {
        collectionJob: { cancelCollectionJob: cancelledCollectionJob }
      } = await cancelCollectionJobByMutation(job.id, { transaction });

      expect(cancelledCollectionJob.status).toEqual('CANCELLED');
      const { collectionJob: storedCollectionJob } = await getTestCollectionJob(
        job.id,
        { transaction }
      );
      expect(storedCollectionJob.status).toEqual('CANCELLED');
      for (const test of storedCollectionJob.testStatus) {
        expect(test.status).toEqual('CANCELLED');
      }
    });
  });

  it('should retry a cancelled job with only remaining tests', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({ transaction });
      const collectionJob = await getCollectionJobById({
        id: job.id,
        transaction
      });
      const secret = await getJobSecret(collectionJob.id, { transaction });

      // start "RUNNING" the job
      const response1 = await sessionAgent
        .post(`/api/jobs/${collectionJob.id}`)
        .send({ status: 'RUNNING' })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response1.statusCode).toBe(200);

      // simulate a response for a test
      const automatedTestResponse = 'AUTOMATED TEST RESPONSE';
      const ats = await AtLoader().getAll({ transaction });
      const browsers = await BrowserLoader().getAll({ transaction });
      const at = ats.find(
        at => at.id === collectionJob.testPlanRun.testPlanReport.at.id
      );
      const browser = browsers.find(
        browser =>
          browser.id === collectionJob.testPlanRun.testPlanReport.browser.id
      );
      const { tests } =
        collectionJob.testPlanRun.testPlanReport.testPlanVersion;
      const selectedTestIndex = 2;

      const selectedTest = tests[selectedTestIndex];
      const selectedTestRowNumber = selectedTest.rowNumber;

      const numberOfScenarios = selectedTest.scenarios.filter(
        scenario => scenario.atId === at.id
      ).length;
      const response2 = await sessionAgent
        .post(`/api/jobs/${collectionJob.id}/test/${selectedTestRowNumber}`)
        .send({
          capabilities: {
            atName: at.name,
            atVersion: at.atVersions[0].name,
            browserName: browser.name,
            browserVersion: browser.browserVersions[0].name
          },
          responses: new Array(numberOfScenarios).fill(automatedTestResponse)
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response2.statusCode).toBe(200);
      // cancel the job
      const {
        collectionJob: { cancelCollectionJob: cancelledCollectionJob }
      } = await cancelCollectionJobByMutation(collectionJob.id, {
        transaction
      });

      // check canceled status

      expect(cancelledCollectionJob.status).toEqual('CANCELLED');
      const { collectionJob: storedCollectionJob } = await getTestCollectionJob(
        collectionJob.id,
        { transaction }
      );
      expect(storedCollectionJob.status).toEqual('CANCELLED');
      for (const test of storedCollectionJob.testStatus) {
        const expectedStatus =
          test.test.id == selectedTest.id ? 'COMPLETED' : 'CANCELLED';
        expect(test.status).toEqual(expectedStatus);
      }

      // retry job
      const data = await retryCanceledCollectionJobByMutation(
        collectionJob.id,
        { transaction }
      );
      expect(data.collectionJob.retryCanceledCollections.status).toBe('QUEUED');
      const { collectionJob: restartedCollectionJob } =
        await getTestCollectionJob(collectionJob.id, { transaction });
      // check restarted status
      expect(restartedCollectionJob.status).toEqual('QUEUED');
      for (const test of restartedCollectionJob.testStatus) {
        const expectedStatus =
          test.test.id == selectedTest.id ? 'COMPLETED' : 'QUEUED';
        expect(test.status).toEqual(expectedStatus);
      }
      const expectedTests = tests.filter(
        test => test.at.key === 'voiceover_macos' && test.id != selectedTest.id
      );
      // check testIds - order doesn't matter, so we sort them
      expect(
        startCollectionJobSimulation.lastCallParams.testIds.sort()
      ).toEqual(expectedTests.map(test => test.id).sort());
    });
  });

  it('should gracefully reject request to cancel a job that does not exist', async () => {
    await dbCleaner(async transaction => {
      expect.assertions(1); // Make sure an assertion is made
      await expect(
        cancelCollectionJobByMutation(2, { transaction })
      ).rejects.toThrow('Could not find collection job with id 2');
    });
  });

  it('should restart a job', async () => {
    await dbCleaner(async transaction => {
      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({ transaction });

      const { restartCollectionJob: collectionJob } =
        await restartCollectionJobByMutation(job.id, { transaction });

      expect(collectionJob).not.toBe(undefined);
      expect(collectionJob).toEqual({
        id: job.id,
        status: 'QUEUED'
      });

      const { collectionJob: storedCollectionJob } = await getTestCollectionJob(
        job.id,
        { transaction }
      );
      expect(storedCollectionJob.id).toEqual(job.id);
      expect(storedCollectionJob.status).toEqual('QUEUED');
    });
  });

  it('should gracefully reject restarting a job that does not exist', async () => {
    await dbCleaner(async transaction => {
      const { restartCollectionJob: res } =
        await restartCollectionJobByMutation(2, { transaction });
      expect(res).toEqual(null);
    });
  });

  it('should not update a job status without verification', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({ transaction });
      const response = await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .set('x-transaction-id', transaction.id);
      expect(response.body).toEqual({
        error: 'Unauthorized'
      });
      expect(response.statusCode).toBe(403);
    });
  });

  it('should fail to update a job status with invalid status', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({ transaction });
      const secret = await getJobSecret(job.id, { transaction });
      const response = await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .send({ status: 'INVALID' })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid status: INVALID'
      });
    });
  });

  it('should fail to update a job status for a non-existent jobId', async () => {
    const response = await sessionAgent
      .post(`/api/jobs/${444}`)
      .send({ status: 'RUNNING' })
      .set('x-automation-secret', process.env.AUTOMATION_SCHEDULER_SECRET);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: `Could not find job with jobId: ${444}`
    });
  });

  it('should update a job status with verification', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({ transaction });
      const secret = await getJobSecret(job.id, { transaction });
      const response = await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .send({ status: 'RUNNING' })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      const { body } = response;
      expect(response.statusCode).toBe(200);
      expect(body.id).toEqual(parseInt(job.id));
      expect(body.status).toEqual('RUNNING');
      expect(body).toHaveProperty('testPlanRunId');
      expect(body.testPlanRun.testPlanReportId).toEqual(
        parseInt(testPlanReportId)
      );

      const { collectionJob: storedCollectionJob } = await getTestCollectionJob(
        job.id,
        { transaction }
      );
      expect(storedCollectionJob.id).toEqual(job.id);
      expect(storedCollectionJob.status).toEqual('RUNNING');
      expect(storedCollectionJob.externalLogsUrl).toEqual(null);
      expect(storedCollectionJob.testPlanRun.testPlanReport.id).toEqual(
        testPlanReportId
      );
    });
  });

  it('should update a job externalLogsUrl with verification', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({ transaction });
      const secret = await getJobSecret(job.id, { transaction });
      const response = await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .send({
          status: 'CANCELLED',
          externalLogsUrl: 'https://www.aol.com/'
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      const { body } = response;
      expect(response.statusCode).toBe(200);
      expect(body.id).toEqual(parseInt(job.id));
      expect(body.status).toEqual('CANCELLED');
      expect(body).toHaveProperty('testPlanRunId');
      expect(body.testPlanRun.testPlanReportId).toEqual(
        parseInt(testPlanReportId)
      );

      const { collectionJob: storedCollectionJob } = await getTestCollectionJob(
        job.id,
        { transaction }
      );
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
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({ transaction });
      const secret = await getJobSecret(job.id, { transaction });
      const collectionJob = await getCollectionJobById({
        id: job.id,
        transaction
      });
      await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .send({ status: 'RUNNING' })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      const automatedTestResponse = 'AUTOMATED TEST RESPONSE';
      const ats = await AtLoader().getAll({ transaction });
      const browsers = await BrowserLoader().getAll({ transaction });
      const at = ats.find(
        at => at.id === collectionJob.testPlanRun.testPlanReport.at.id
      );
      const browser = browsers.find(
        browser =>
          browser.id === collectionJob.testPlanRun.testPlanReport.browser.id
      );
      const { tests } =
        collectionJob.testPlanRun.testPlanReport.testPlanVersion;
      const selectedTestIndex = 2;

      const selectedTest = tests[selectedTestIndex];
      const selectedTestRowNumber = selectedTest.rowNumber;

      const numberOfScenarios = selectedTest.scenarios.filter(
        scenario => scenario.atId === at.id
      ).length;
      const response = await sessionAgent
        .post(`/api/jobs/${job.id}/test/${selectedTestRowNumber}`)
        .send({
          capabilities: {
            atName: at.name,
            atVersion: at.atVersions[0].name,
            browserName: browser.name,
            browserVersion: browser.browserVersions[0].name
          },
          responses: new Array(numberOfScenarios).fill(automatedTestResponse)
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response.statusCode).toBe(200);
      const storedTestPlanRun = await getTestPlanRun(
        collectionJob.testPlanRun.id,
        { transaction }
      );
      const { testResults } = storedTestPlanRun.testPlanRun;
      testResults.forEach(testResult => {
        expect(testResult.test.id).toEqual(selectedTest.id);
        expect(testResult.atVersion.name).toEqual(at.atVersions[0].name);
        expect(testResult.browserVersion.name).toEqual(
          browser.browserVersions[0].name
        );
        testResult.scenarioResults.forEach(scenarioResult => {
          expect(scenarioResult.output).toEqual(automatedTestResponse);
          scenarioResult.assertionResults.forEach(assertionResult => {
            expect(assertionResult.passed).toEqual(null);
            expect(assertionResult.failedReason).toEqual(
              'AUTOMATED_OUTPUT_DIFFERS'
            );
          });
          scenarioResult.negativeSideEffects?.forEach(negativeSideEffect => {
            expect(negativeSideEffect.id).toEqual('OTHER');
            expect(negativeSideEffect.details).toEqual(null);
          });
        });
      });
      // also marks status for test as COMPLETED
      const { collectionJob: storedCollectionJob } = await getTestCollectionJob(
        job.id,
        { transaction }
      );
      expect(storedCollectionJob.id).toEqual(job.id);
      expect(storedCollectionJob.status).toEqual('RUNNING');
      const testStatus = storedCollectionJob.testStatus.find(
        status => status.test.id === selectedTest.id
      );
      expect(testStatus.status).toEqual(COLLECTION_JOB_STATUS.COMPLETED);
    });
  });

  it('should update job results with decimal presentationNumber', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({
          transaction,
          reportId: '19'
        });
      const secret = await getJobSecret(job.id, { transaction });
      const collectionJob = await getCollectionJobById({
        id: job.id,
        transaction
      });
      await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .send({ status: 'RUNNING' })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      const automatedTestResponse = 'AUTOMATED TEST RESPONSE';
      const ats = await AtLoader().getAll({ transaction });
      const browsers = await BrowserLoader().getAll({ transaction });
      const at = ats.find(
        at => at.id === collectionJob.testPlanRun.testPlanReport.at.id
      );
      const browser = browsers.find(
        browser =>
          browser.id === collectionJob.testPlanRun.testPlanReport.browser.id
      );
      const { tests } =
        collectionJob.testPlanRun.testPlanReport.testPlanVersion;
      const testResultsNumber = collectionJob.testPlanRun.testResults.length;
      const selectedTest = tests.find(
        test => test.rowNumber === 14.1 && test.at.key === 'nvda'
      );
      expect(selectedTest).toBeDefined();

      const numberOfScenarios = selectedTest.scenarios.filter(
        scenario => scenario.atId === at.id
      ).length;

      const response = await sessionAgent
        .post(`/api/jobs/${job.id}/test/${selectedTest.rowNumber}`)
        .send({
          capabilities: {
            atName: at.name,
            atVersion: at.atVersions[0].name,
            browserName: browser.name,
            browserVersion: browser.browserVersions[0].name
          },
          responses: new Array(numberOfScenarios).fill(automatedTestResponse)
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response.statusCode).toBe(200);
      const storedTestPlanRun = await getTestPlanRun(
        collectionJob.testPlanRun.id,
        { transaction }
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
            expect(assertionResult.passed).toEqual(null);
            expect(assertionResult.failedReason).toEqual(
              'AUTOMATED_OUTPUT_DIFFERS'
            );
          });
          scenarioResult.negativeSideEffects?.forEach(negativeSideEffect => {
            expect(negativeSideEffect.id).toEqual('OTHER');
            expect(negativeSideEffect.details).toEqual(null);
          });
        });
      });
      // also marks status for test as COMPLETED
      const { collectionJob: storedCollectionJob } = await getTestCollectionJob(
        job.id,
        { transaction }
      );
      expect(storedCollectionJob.id).toEqual(job.id);
      expect(storedCollectionJob.status).toEqual('RUNNING');
      const testStatus = storedCollectionJob.testStatus.find(
        status => status.test.id === selectedTest.id
      );
      expect(testStatus.status).toEqual(COLLECTION_JOB_STATUS.COMPLETED);
    });
  });

  it('should properly handle per-test status updates without capabilities present', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({ transaction });
      const secret = await getJobSecret(job.id, { transaction });
      const collectionJob = await getCollectionJobById({
        id: job.id,
        transaction
      });
      // flag overall job as RUNNING
      const externalLogsUrl = 'https://example.com/test/log/url';
      await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .send({ status: 'RUNNING', externalLogsUrl })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);

      const { tests } =
        collectionJob.testPlanRun.testPlanReport.testPlanVersion;
      const selectedTestIndex = 2;
      const selectedTest = tests[selectedTestIndex];
      const selectedTestRowNumber = selectedTest.rowNumber;
      let response = await sessionAgent
        .post(`/api/jobs/${job.id}/test/${selectedTestRowNumber}`)
        .send({
          status: COLLECTION_JOB_STATUS.RUNNING
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response.statusCode).toBe(200);

      let { collectionJob: storedCollectionJob } = await getTestCollectionJob(
        job.id,
        { transaction }
      );
      expect(storedCollectionJob.id).toEqual(job.id);
      expect(storedCollectionJob.status).toEqual('RUNNING');
      expect(storedCollectionJob.externalLogsUrl).toEqual(externalLogsUrl);
      let foundStatus = false;
      for (const testStatus of storedCollectionJob.testStatus) {
        let expectedStatus = COLLECTION_JOB_STATUS.QUEUED;
        if (testStatus.test.id === selectedTest.id) {
          foundStatus = true;
          expectedStatus = COLLECTION_JOB_STATUS.RUNNING;
        }
        expect(testStatus.status).toEqual(expectedStatus);
      }
      expect(foundStatus).toEqual(true);

      // check that putting this test into ERROR and sending an overall
      // collection job ERROR will properly update things
      response = await sessionAgent
        .post(`/api/jobs/${job.id}/test/${selectedTestRowNumber}`)
        .send({
          status: COLLECTION_JOB_STATUS.ERROR
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response.statusCode).toBe(200);

      response = await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .send({
          // avoiding sending externalLogsUrl here to test that when
          // missing it is not overwritten/emptied.
          status: COLLECTION_JOB_STATUS.ERROR
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response.statusCode).toBe(200);

      storedCollectionJob = (
        await getTestCollectionJob(job.id, { transaction })
      ).collectionJob;
      expect(storedCollectionJob.id).toEqual(job.id);
      expect(storedCollectionJob.status).toEqual('ERROR');
      expect(storedCollectionJob.externalLogsUrl).toEqual(externalLogsUrl);
      foundStatus = false;
      for (const testStatus of storedCollectionJob.testStatus) {
        let expectedStatus = COLLECTION_JOB_STATUS.CANCELLED;
        if (testStatus.test.id === selectedTest.id) {
          foundStatus = true;
          expectedStatus = COLLECTION_JOB_STATUS.ERROR;
        }
        expect(testStatus.status).toEqual(expectedStatus);
      }
      expect(foundStatus).toEqual(true);
    });
  });

  it('should convert RUNNING test status to ERROR when job state becomes ERROR', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({ transaction });
      const secret = await getJobSecret(job.id, { transaction });
      const collectionJob = await getCollectionJobById({
        id: job.id,
        transaction
      });
      // flag overall job as RUNNING
      const externalLogsUrl = 'https://example.com/test/log/url';
      await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .send({ status: 'RUNNING', externalLogsUrl })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);

      const { tests } =
        collectionJob.testPlanRun.testPlanReport.testPlanVersion;
      const selectedTestIndex = 2;
      const selectedTest = tests[selectedTestIndex];
      const selectedTestRowNumber = selectedTest.rowNumber;
      let response = await sessionAgent
        .post(`/api/jobs/${job.id}/test/${selectedTestRowNumber}`)
        .send({
          status: COLLECTION_JOB_STATUS.RUNNING
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response.statusCode).toBe(200);

      let { collectionJob: storedCollectionJob } = await getTestCollectionJob(
        job.id,
        { transaction }
      );
      expect(storedCollectionJob.id).toEqual(job.id);
      expect(storedCollectionJob.status).toEqual('RUNNING');
      expect(storedCollectionJob.externalLogsUrl).toEqual(externalLogsUrl);
      let foundStatus = false;
      for (const testStatus of storedCollectionJob.testStatus) {
        let expectedStatus = COLLECTION_JOB_STATUS.QUEUED;
        if (testStatus.test.id === selectedTest.id) {
          foundStatus = true;
          expectedStatus = COLLECTION_JOB_STATUS.RUNNING;
        }
        expect(testStatus.status).toEqual(expectedStatus);
      }
      expect(foundStatus).toEqual(true);

      // Leave our test RUNNING but ERROR the job

      response = await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .send({
          // avoiding sending externalLogsUrl here to test that when
          // missing it is not overwritten/emptied.
          status: COLLECTION_JOB_STATUS.ERROR
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response.statusCode).toBe(200);

      storedCollectionJob = (
        await getTestCollectionJob(job.id, { transaction })
      ).collectionJob;
      expect(storedCollectionJob.id).toEqual(job.id);
      expect(storedCollectionJob.status).toEqual('ERROR');
      expect(storedCollectionJob.externalLogsUrl).toEqual(externalLogsUrl);
      foundStatus = false;
      for (const testStatus of storedCollectionJob.testStatus) {
        let expectedStatus = COLLECTION_JOB_STATUS.CANCELLED;
        if (testStatus.test.id === selectedTest.id) {
          foundStatus = true;
          expectedStatus = COLLECTION_JOB_STATUS.ERROR;
        }
        expect(testStatus.status).toEqual(expectedStatus);
      }
      expect(foundStatus).toEqual(true);
    });
  });

  it('should convert RUNNING test status to CANCELLED when job state becomes CANCELLED', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({ transaction });
      const secret = await getJobSecret(job.id, { transaction });
      const collectionJob = await getCollectionJobById({
        id: job.id,
        transaction
      });
      // flag overall job as RUNNING
      const externalLogsUrl = 'https://example.com/test/log/url';
      await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .send({ status: 'RUNNING', externalLogsUrl })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);

      const { tests } =
        collectionJob.testPlanRun.testPlanReport.testPlanVersion;
      const selectedTestIndex = 2;
      const selectedTest = tests[selectedTestIndex];
      const selectedTestRowNumber = selectedTest.rowNumber;
      let response = await sessionAgent
        .post(`/api/jobs/${job.id}/test/${selectedTestRowNumber}`)
        .send({
          status: COLLECTION_JOB_STATUS.RUNNING
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response.statusCode).toBe(200);

      let { collectionJob: storedCollectionJob } = await getTestCollectionJob(
        job.id,
        { transaction }
      );
      expect(storedCollectionJob.id).toEqual(job.id);
      expect(storedCollectionJob.status).toEqual('RUNNING');
      expect(storedCollectionJob.externalLogsUrl).toEqual(externalLogsUrl);
      let foundStatus = false;
      for (const testStatus of storedCollectionJob.testStatus) {
        let expectedStatus = COLLECTION_JOB_STATUS.QUEUED;
        if (testStatus.test.id === selectedTest.id) {
          foundStatus = true;
          expectedStatus = COLLECTION_JOB_STATUS.RUNNING;
        }
        expect(testStatus.status).toEqual(expectedStatus);
      }
      expect(foundStatus).toEqual(true);

      // Leave our test RUNNING but CANCELLED the job

      response = await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .send({
          // avoiding sending externalLogsUrl here to test that when
          // missing it is not overwritten/emptied.
          status: COLLECTION_JOB_STATUS.CANCELLED
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response.statusCode).toBe(200);

      storedCollectionJob = (
        await getTestCollectionJob(job.id, { transaction })
      ).collectionJob;
      expect(storedCollectionJob.id).toEqual(job.id);
      expect(storedCollectionJob.status).toEqual('CANCELLED');
      expect(storedCollectionJob.externalLogsUrl).toEqual(externalLogsUrl);
      for (const testStatus of storedCollectionJob.testStatus) {
        expect(testStatus.status).toEqual(COLLECTION_JOB_STATUS.CANCELLED);
      }
    });
  });

  it('should convert RUNNING test status to CANCELLED when job state becomes COMPLETED', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({ transaction });
      const secret = await getJobSecret(job.id, { transaction });
      const collectionJob = await getCollectionJobById({
        id: job.id,
        transaction
      });
      // flag overall job as RUNNING
      const externalLogsUrl = 'https://example.com/test/log/url';
      let response = await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .send({ status: 'RUNNING', externalLogsUrl })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);

      expect(response.statusCode).toBe(200);

      const { tests } =
        collectionJob.testPlanRun.testPlanReport.testPlanVersion;
      const selectedTestIndex = 2;
      const selectedTest = tests[selectedTestIndex];
      const selectedTestRowNumber = selectedTest.rowNumber;
      response = await sessionAgent
        .post(`/api/jobs/${job.id}/test/${selectedTestRowNumber}`)
        .send({
          status: COLLECTION_JOB_STATUS.RUNNING
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response.statusCode).toBe(200);

      let { collectionJob: storedCollectionJob } = await getTestCollectionJob(
        job.id,
        { transaction }
      );
      expect(storedCollectionJob.id).toEqual(job.id);
      expect(storedCollectionJob.status).toEqual('RUNNING');
      expect(storedCollectionJob.externalLogsUrl).toEqual(externalLogsUrl);
      let foundStatus = false;
      for (const testStatus of storedCollectionJob.testStatus) {
        let expectedStatus = COLLECTION_JOB_STATUS.QUEUED;
        if (testStatus.test.id === selectedTest.id) {
          foundStatus = true;
          expectedStatus = COLLECTION_JOB_STATUS.RUNNING;
        }
        expect(testStatus.status).toEqual(expectedStatus);
      }
      expect(foundStatus).toEqual(true);

      // Leave our test RUNNING but COMPLETED the job

      response = await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .send({
          // avoiding sending externalLogsUrl here to test that when
          // missing it is not overwritten/emptied.
          status: COLLECTION_JOB_STATUS.COMPLETED
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response.statusCode).toBe(200);

      storedCollectionJob = (
        await getTestCollectionJob(job.id, { transaction })
      ).collectionJob;
      expect(storedCollectionJob.id).toEqual(job.id);
      expect(storedCollectionJob.status).toEqual('COMPLETED');
      expect(storedCollectionJob.externalLogsUrl).toEqual(externalLogsUrl);
      foundStatus = false;
      for (const testStatus of storedCollectionJob.testStatus) {
        let expectedStatus = COLLECTION_JOB_STATUS.CANCELLED;
        if (testStatus.test.id === selectedTest.id) {
          foundStatus = true;
          expectedStatus = COLLECTION_JOB_STATUS.CANCELLED;
        }
        expect(testStatus.status).toEqual(expectedStatus);
      }
      expect(foundStatus).toEqual(true);
    });
  });

  it('should copy assertion results when updating with results that match historical results', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const context = getGraphQLContext({
        req: {
          session: { user: { roles: [{ name: 'ADMIN' }] } },
          transaction
        }
      });

      // Start by getting historical results for comparing later
      // Use a finalized RECOMMENDED report
      const finalizedTestPlanVersion = await markAsFinalResolver(
        { parentContext: { id: '25' } },
        {},
        context
      );

      const { testPlanReport } = await getTestPlanReport(
        finalizedTestPlanVersion.testPlanReport.id,
        { transaction }
      );

      const selectedTestIndex = 0;
      const { at, browser } = testPlanReport;

      const historicalTestResult =
        testPlanReport.finalizedTestResults[selectedTestIndex];

      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({
          transaction,
          reportId: '25' // Use the same report ID as our historical report
        });
      const collectionJob = await getCollectionJobById({
        id: job.id,
        transaction
      });

      const { tests } =
        collectionJob.testPlanRun.testPlanReport.testPlanVersion;
      const selectedTest = tests.find(
        t => t.id === historicalTestResult?.test?.id
      );
      expect(selectedTest).toBeDefined();
      const selectedTestRowNumber = selectedTest.rowNumber;

      const secret = await getJobSecret(job.id, { transaction });

      let response = await sessionAgent
        .post(`/api/jobs/${job.id}`)
        .send({ status: 'RUNNING' })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response.statusCode).toBe(200);

      response = await sessionAgent
        .post(`/api/jobs/${job.id}/test/${selectedTestRowNumber}`)
        .send({
          capabilities: {
            atName: at.name,
            atVersion: testPlanReport.exactAtVersion.name,
            browserName: browser.name,
            browserVersion: browser.browserVersions[0].name
          },
          responses: historicalTestResult?.scenarioResults.map(sr => sr.output)
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(response.statusCode).toBe(200);

      const storedTestPlanRun = await getTestPlanRun(
        collectionJob.testPlanRun.id,
        { transaction }
      );

      const { testResults } = storedTestPlanRun.testPlanRun;

      testResults.forEach(testResult => {
        expect(testResult.test.id).toEqual(historicalTestResult.test.id);
        expect(testResult.atVersion.name).toEqual(
          testPlanReport.exactAtVersion.name
        );
        expect(testResult.browserVersion.name).toEqual(
          browser.browserVersions[0].name
        );
        testResult.scenarioResults.forEach((scenarioResult, index) => {
          const historicalScenarioResult =
            historicalTestResult.scenarioResults[index];
          expect(scenarioResult.output).toEqual(
            historicalScenarioResult.output
          );

          scenarioResult.assertionResults.forEach((assertionResult, index) => {
            const historicalAssertionResult =
              historicalScenarioResult.assertionResults[index];
            expect(assertionResult.passed).toEqual(
              historicalAssertionResult.passed
            );
            expect(assertionResult.failedReason).toEqual(
              historicalAssertionResult.failedReason
            );
          });
          scenarioResult.negativeSideEffects?.forEach(
            (negativeSideEffect, index) => {
              expect(negativeSideEffect.id).toEqual(
                historicalScenarioResult.negativeSideEffects[index].id
              );
              expect(negativeSideEffect.details).toEqual(
                historicalScenarioResult.negativeSideEffects[index].details
              );
            }
          );
        });
      });
    });
  });

  it('should delete a job', async () => {
    await dbCleaner(async transaction => {
      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({ transaction });
      const { collectionJob: storedCollectionJob } = await getTestCollectionJob(
        job.id,
        { transaction }
      );
      expect(storedCollectionJob.id).toEqual(job.id);

      const res = await deleteCollectionJobByMutation(job.id, {
        transaction
      });
      expect(res).toEqual({
        deleteCollectionJob: 1
      });

      const { collectionJob: deletedCollectionJob } =
        await getTestCollectionJob(job.id, { transaction });
      expect(deletedCollectionJob).toEqual(null);
    });
  });

  it('should create collection jobs from previous AT version', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      //  VoiceOver
      const targetAt = await getAtById({ id: 3, transaction });
      expect(targetAt).toBeDefined();

      const currentAtVersion = await getAtVersionByQuery({
        where: {
          atId: 3,
          name: '14.0'
        },
        transaction
      });
      expect(currentAtVersion).toBeDefined();

      const response = await createCollectionJobsFromPreviousVersionMutation(
        currentAtVersion.id,
        { transaction }
      );
      const result = response.createCollectionJobsFromPreviousAtVersion;

      expect(result).toBeDefined();
      const { collectionJobs } = result;
      expect(Array.isArray(collectionJobs)).toBe(true);
      expect(collectionJobs.length).toBe(4);

      collectionJobs.forEach(job => {
        const report = job.testPlanRun.testPlanReport;
        expect(report.at.id.toString()).toBe('3');
        expect(report.exactAtVersion.name).toBe('14.0');
      });
    });
  });

  const commonVerdictCopyingSetup = async ({
    transaction,
    diffOutputs = 0
  }) => {
    // Start by getting historical results for comparing later
    // Use a finalized RECOMMENDED report
    const { testPlanReport: historicalReport } = await getTestPlanReport('25', {
      transaction
    });
    expect(historicalReport).toBeDefined();
    expect(historicalReport.markedFinalAt).not.toBeNull();

    const currentAtVersion = await getAtVersionByQuery({
      where: { atId: 3, name: '14.0' },
      transaction
    });
    expect(currentAtVersion).toBeDefined();
    const createResponse =
      await createCollectionJobsFromPreviousVersionMutation(
        currentAtVersion.id,
        { transaction }
      );
    const result = createResponse.createCollectionJobsFromPreviousAtVersion;
    expect(result).toBeDefined();
    expect(Array.isArray(result.collectionJobs)).toBe(true);
    expect(result.collectionJobs.length).toBeGreaterThan(0);

    // Find the collection job for the same test plan version as our historical report
    const { collectionJob: newJob } = await getTestCollectionJob(
      result.collectionJobs[0].id,
      { transaction }
    );
    expect(newJob).toBeDefined();

    const secret = await getJobSecret(newJob.id, { transaction });
    let updateResponse = await sessionAgent
      .post(`/api/jobs/${newJob.id}`)
      .send({ status: 'RUNNING' })
      .set('x-automation-secret', secret)
      .set('x-transaction-id', transaction.id);
    expect(updateResponse.statusCode).toBe(200);

    // Update test results for every historical test result with matching outputs
    for (const historicalResult of historicalReport.finalizedTestResults) {
      const testRowNumber = historicalResult.test.rowNumber;
      const responses = historicalResult.scenarioResults.map(sr => sr.output);
      for (let i = 0; i < diffOutputs && i < responses.length; i++) {
        responses[i] = 'This is a different output';
      }
      const updateRes = await sessionAgent
        .post(`/api/jobs/${newJob.id}/test/${testRowNumber}`)
        .send({
          responses,
          capabilities: {
            atName: historicalReport.at.name,
            atVersion: newJob.testPlanRun.testPlanReport.exactAtVersion.name,
            browserName: historicalReport.browser.name,
            browserVersion: historicalResult.browserVersion.name
          }
        })
        .set('x-automation-secret', secret)
        .set('x-transaction-id', transaction.id);
      expect(updateRes.statusCode).toBe(200);
    }

    // Verify that for every updated test result, the assertion results are copied from the corresponding historical result
    const updatedRun = await getTestPlanRun(newJob.testPlanRun.id, {
      transaction
    });
    for (const historicalResult of historicalReport.finalizedTestResults) {
      const newTestResult = updatedRun.testPlanRun.testResults.find(
        tr => tr.test.id === historicalResult.test.id
      );
      let diffOutputsAvailable = diffOutputs;
      expect(newTestResult).toBeDefined();
      newTestResult.scenarioResults.forEach((scenarioResult, i) => {
        const historicalScenario = historicalResult.scenarioResults[i];
        if (scenarioResult.output !== historicalScenario.output) {
          if (diffOutputsAvailable > 0) {
            diffOutputsAvailable--;
          } else {
            console.error(
              `Output mismatch for scenario ${i}: expected "${historicalScenario.output}" but got "${scenarioResult.output}" and have ${diffOutputsAvailable} diff tolerance remaining`
            );
            expect(false).toBe(true);
          }
        } else {
          scenarioResult.assertionResults.forEach((assertionResult, j) => {
            const historicalAssertionResult =
              historicalScenario.assertionResults[j];
            expect(assertionResult.passed).toEqual(
              historicalAssertionResult.passed
            );
            expect(assertionResult.failedReason).toEqual(
              historicalAssertionResult.failedReason
            );
          });
        }
      });
    }
    const { testPlanReport: finalReport } = await getTestPlanReport(
      newJob.testPlanRun.testPlanReport.id,
      { transaction }
    );
    return finalReport;
  };

  it('should copy historical assertion results from historical report (previous automatable AT version) and auto-finalize new test report when outputs match', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const finalReport = await commonVerdictCopyingSetup({
        transaction
      });

      // Since all tests have matching outputs, the report should be auto-finalized
      expect(finalReport.markedFinalAt).not.toBeNull();
    });
  });

  it('should not auto-finalize new test report when outputs do not match', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const finalReport = await commonVerdictCopyingSetup({
        transaction,
        diffOutputs: 1
      });

      // Since there is one test with a different output, the report should not be auto-finalized
      expect(finalReport.markedFinalAt).toBeNull();
    });
  });
});
