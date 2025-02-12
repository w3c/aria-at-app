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
  getTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const { createAtVersion } = require('../../models/services/AtVersionService');

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
                    at { name }
                    browser { name }
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
                            unexpectedBehaviors {
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
                            unexpectedBehaviors {
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
            expect(assertionResult.passed).toEqual(false);
            expect(assertionResult.failedReason).toEqual('AUTOMATED_OUTPUT');
          });
          scenarioResult.unexpectedBehaviors?.forEach(unexpectedBehavior => {
            expect(unexpectedBehavior.id).toEqual('OTHER');
            expect(unexpectedBehavior.details).toEqual(null);
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
            expect(assertionResult.passed).toEqual(false);
            expect(assertionResult.failedReason).toEqual('AUTOMATED_OUTPUT');
          });
          scenarioResult.unexpectedBehaviors?.forEach(unexpectedBehavior => {
            expect(unexpectedBehavior.id).toEqual('OTHER');
            expect(unexpectedBehavior.details).toEqual(null);
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
      // Test plan report used for test is in Draft so it
      // must be markedAsFinal to have historical results
      const finalizedTestPlanVersion = await markAsFinalResolver(
        { parentContext: { id: testPlanReportId } },
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
      expect(historicalTestResult).not.toEqual(undefined);
      const historicalResponses = historicalTestResult?.scenarioResults.map(
        scenarioResult => scenarioResult.output
      );
      const { atVersion, browserVersion } = historicalTestResult;

      const { scheduleCollectionJob: job } =
        await scheduleCollectionJobByMutation({ transaction });
      const collectionJob = await getCollectionJobById({
        id: job.id,
        transaction
      });
      const { secret } = collectionJob;

      const { tests } =
        collectionJob.testPlanRun.testPlanReport.testPlanVersion;

      const selectedTestRowNumber = tests.find(
        t => t.id === historicalTestResult.test.id
      ).rowNumber;

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
            atVersion: atVersion.name,
            browserName: browser.name,
            browserVersion: browserVersion.name
          },
          responses: historicalResponses
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
        expect(testResult.atVersion.name).toEqual(atVersion.name);
        expect(testResult.browserVersion.name).toEqual(browserVersion.name);
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
          scenarioResult.unexpectedBehaviors?.forEach(
            (unexpectedBehavior, index) => {
              expect(unexpectedBehavior.id).toEqual(
                historicalScenarioResult.unexpectedBehaviors[index].id
              );
              expect(unexpectedBehavior.details).toEqual(
                historicalScenarioResult.unexpectedBehaviors[index].details
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
        deleteCollectionJob: true
      });

      const { collectionJob: deletedCollectionJob } =
        await getTestCollectionJob(job.id, { transaction });
      expect(deletedCollectionJob).toEqual(null);
    });
  });

  it('should create collection jobs from previous AT version', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      // Setup: Retrieve target AT and create old/new versions.
      const ats = await AtLoader().getAll({ transaction });
      const targetAt = ats.find(at => at.key === 'voiceover_macos');
      expect(targetAt).toBeDefined();

      const oldAtVersion = await createAtVersion({
        values: {
          atId: targetAt.id,
          name: 'Old Version',
          releasedAt: new Date('2025-01-01')
        },
        transaction
      });
      const newAtVersion = await createAtVersion({
        values: {
          atId: targetAt.id,
          name: 'New Version',
          releasedAt: new Date('2025-02-01')
        },
        transaction
      });

      // Update two test plan reports with the old version and mark them final.
      const testPlanReport1 = await getTestPlanReportById({
        id: testPlanReportId,
        transaction
      });
      const testPlanReport2 = await getTestPlanReportById({
        id: '26',
        transaction
      });
      // This direct update doesn't reflect real world behavior, but is
      // necessary to test the mutation.
      await Promise.all([
        testPlanReport1.update(
          { exactAtVersionId: oldAtVersion.id, markedFinalAt: new Date() },
          { transaction }
        ),
        testPlanReport2.update(
          { exactAtVersionId: oldAtVersion.id, markedFinalAt: new Date() },
          { transaction }
        )
      ]);

      // Create collection jobs from previous version using mutation.
      const mutation = `
        mutation {
          createCollectionJobsFromPreviousVersion(atVersionId: "${newAtVersion.id}") {
            collectionJobs {
              id
              status
              testPlanRun {
                id
                tester { id username isBot }
                testPlanReport {
                  id
                  at { id name }
                  browser { id name }
                  exactAtVersion { id name }
                  testPlanVersion { id }
                  markedFinalAt
                }
              }
              testStatus { test { id rowNumber } status }
            }
            message
          }
        }
      `;
      const result = await mutate(mutation, {
        transaction,
        user: { roles: [{ name: 'ADMIN' }] }
      });
      const response = result.createCollectionJobsFromPreviousVersion;
      expect(response.collectionJobs).toBeDefined();
      expect(response.collectionJobs.length).toBe(2);
      expect(response.message).toContain(
        'Successfully created 2 collection jobs'
      );

      // Validate basic properties of each created job.
      response.collectionJobs.forEach(job => {
        expect(job.status).toBe('QUEUED');
        expect(job.testPlanRun).toBeDefined();
        expect(job.testPlanRun.tester).toBeDefined();
        expect(job.testPlanRun.tester.isBot).toBe(true);
        expect(job.testPlanRun.testPlanReport).toBeDefined();
        expect(job.testPlanRun.testPlanReport.at.id.toString()).toBe(
          targetAt.id.toString()
        );
        job.testStatus.forEach(ts => expect(ts.status).toBe('QUEUED'));
      });
      const uniqueJobIds = new Set(response.collectionJobs.map(job => job.id));
      expect(uniqueJobIds.size).toBe(2);

      response.collectionJobs.forEach(job => {
        const report = job.testPlanRun.testPlanReport;
        const original = [testPlanReport1, testPlanReport2].find(
          orig =>
            orig.atId.toString() === report.at.id.toString() &&
            orig.browserId.toString() === report.browser.id.toString() &&
            orig.testPlanVersionId.toString() ===
              report.testPlanVersion.id.toString()
        );
        expect(original).toBeDefined();
        expect(report.exactAtVersion.id.toString()).toBe(
          newAtVersion.id.toString()
        );
        expect(report.exactAtVersion.name).toBe('New Version');
        expect(report.markedFinalAt).toBeNull();
      });

      const [jobToSimulate] = response.collectionJobs;

      // Helper function to simulate a job run and verify test responses.
      const simulateJobRun = async job => {
        const fullJob = await getCollectionJobById({ id: job.id, transaction });
        const secret = await getJobSecret(fullJob.id, { transaction });

        // Update job status to RUNNING.
        const runRes = await sessionAgent
          .post(`/api/jobs/${fullJob.id}`)
          .send({ status: 'RUNNING' })
          .set('x-automation-secret', secret)
          .set('x-transaction-id', transaction.id);
        expect(runRes.statusCode).toBe(200);

        const { tests } = fullJob.testPlanRun.testPlanReport.testPlanVersion;
        const voiceTests = tests.filter(
          test => test.at.key === 'voiceover_macos'
        );
        expect(voiceTests.length).toBeGreaterThan(0);
        const [selectedTest1, selectedTest2] = voiceTests;
        expect(selectedTest1).toBeDefined();
        expect(selectedTest2).toBeDefined();

        const historicalReport = await getTestPlanReport(
          fullJob.testPlanRun.testPlanReport.id,
          { transaction }
        );
        const browsers = await BrowserLoader().getAll({ transaction });
        const atDetail = targetAt;
        const browserDetail = browsers.find(
          b => b.id === fullJob.testPlanRun.testPlanReport.browser.id
        );

        for (const { test, useHistoricalOutput } of [
          { test: selectedTest1, useHistoricalOutput: true },
          { test: selectedTest2, useHistoricalOutput: false }
        ]) {
          const historicalResult =
            historicalReport.testPlanReport?.finalizedTestResults?.find(
              tr => tr.test.id === test.id
            );
          const numScenarios = test.scenarios.filter(
            s => s.atId === fullJob.testPlanRun.testPlanReport.at.id
          ).length;
          const histOutput = historicalResult?.scenarioResults[0]?.output;
          const automatedResponse =
            useHistoricalOutput && histOutput
              ? histOutput
              : 'NEW AUTOMATED TEST RESPONSE';

          const testRes = await sessionAgent
            .post(`/api/jobs/${fullJob.id}/test/${test.rowNumber}`)
            .send({
              capabilities: {
                atName: atDetail.name,
                atVersion: atDetail.atVersions[0].name,
                browserName: browserDetail.name,
                browserVersion: browserDetail.browserVersions[0].name
              },
              responses: new Array(numScenarios).fill(automatedResponse)
            })
            .set('x-automation-secret', secret)
            .set('x-transaction-id', transaction.id);
          expect(testRes.statusCode).toBe(200);

          const storedRun = await getTestPlanRun(fullJob.testPlanRun.id, {
            transaction
          });
          const matchingResult = storedRun.testPlanRun.testResults.find(
            tr => tr.test.id === test.id
          );
          expect(matchingResult).toBeDefined();

          matchingResult.scenarioResults.forEach((scenarioResult, idx) => {
            expect(scenarioResult.output).toEqual(automatedResponse);
            const shouldCopy =
              job.id === jobToSimulate.id &&
              historicalResult &&
              useHistoricalOutput &&
              automatedResponse ===
                historicalResult.scenarioResults[idx].output;
            const expectedAssertions = shouldCopy
              ? historicalResult.scenarioResults[idx].assertionResults.map(
                  ar => ({ passed: ar.passed, failedReason: ar.failedReason })
                )
              : scenarioResult.assertionResults.map(() => ({
                  passed: false,
                  failedReason: 'AUTOMATED_OUTPUT'
                }));
            expect(scenarioResult.assertionResults).toEqual(
              expectedAssertions.map(exp => expect.objectContaining(exp))
            );
          });
        }
      };

      await Promise.all(
        response.collectionJobs.map(job => simulateJobRun(job))
      );
    });
  });
});
