const { GracefulShutdownManager } = require('@moebius/http-graceful-shutdown');
const express = require('express');
const {
  verifyAutomationScheduler
} = require('../../middleware/verifyAutomationScheduler');
const { COLLECTION_JOB_STATUS } = require('../../util/enums');
const { default: axios } = require('axios');
const { gql } = require('apollo-server-core');
const { axiosConfig } = require('../../controllers/AutomationController');
const {
  getTransactionById
} = require('../../middleware/transactionMiddleware');
const { query } = require('../util/graphql-test-utilities');

// 0 = no chance of test errors, 1 = always errors
const TEST_ERROR_CHANCE = 0;

const setupMockAutomationSchedulerServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(verifyAutomationScheduler);

  let shutdownManager;
  await new Promise(resolve => {
    const listener = app.listen(process.env.AUTOMATION_SCHEDULER_PORT, resolve);
    shutdownManager = new GracefulShutdownManager(listener);
  });

  const timeout = ms => new Promise(resolve => setTimeout(() => resolve(), ms));

  const simulateJobStatusUpdate = async (jobId, newStatus) => {
    await axios.post(
      `${process.env.APP_SERVER}/api/jobs/${jobId}`,
      {
        status: newStatus
      },
      axiosConfig
    );
  };

  const simulateTestStatusUpdate = async (jobId, testId, newStatus) => {
    await axios.post(
      `${process.env.APP_SERVER}/api/jobs/${jobId}/test/${testId}`,
      {
        status: newStatus
      },
      axiosConfig
    );
  };

  const simulateResultCompletion = async (
    tests,
    atName,
    atVersionName,
    browserName,
    browserVersionName,
    jobId,
    currentTestIndex,
    isV2
  ) => {
    const currentTest = tests[currentTestIndex];
    const { scenarios, assertions } = currentTest;

    const responses = [];
    scenarios.forEach(() => {
      assertions.forEach(() => {
        responses.push('Local development simulated output');
      });
    });

    const testResult = {
      capabilities: {
        atName,
        atVersion: atVersionName,
        browserName,
        browserVersion: browserVersionName
      },
      responses
    };

    try {
      await simulateTestStatusUpdate(
        jobId,
        currentTest.rowNumber,
        COLLECTION_JOB_STATUS.RUNNING
      );
      await timeout(Math.random() * 2000);

      if (Math.random() < TEST_ERROR_CHANCE) {
        await simulateTestStatusUpdate(
          jobId,
          currentTest.rowNumber,
          COLLECTION_JOB_STATUS.ERROR
        );
        return simulateJobStatusUpdate(jobId, COLLECTION_JOB_STATUS.ERROR);
      } else {
        await axios.post(
          `${process.env.APP_SERVER}/api/jobs/${jobId}/test/${currentTest.rowNumber}`,
          testResult,
          axiosConfig
        );
      }

      if (currentTestIndex < tests.length - 1) {
        await timeout(Math.random() * 5000);
        return simulateResultCompletion(
          tests,
          atName,
          atVersionName,
          browserName,
          browserVersionName,
          jobId,
          currentTestIndex + 1,
          isV2
        );
      } else {
        simulateJobStatusUpdate(jobId, COLLECTION_JOB_STATUS.COMPLETED);
      }
    } catch (error) {
      console.error('Error simulating collection job', error);
    }
  };

  app.post('/jobs/new', async (req, res) => {
    if (process.env.ENVIRONMENT === 'test') {
      return res.json({
        status: COLLECTION_JOB_STATUS.QUEUED
      });
    } else {
      // Local development must simulate posting results
      const { jobId, transactionId, atVersion } = req.body;
      const transaction = getTransactionById(transactionId);
      const data = await query(
        gql`
                    query {
                        collectionJob(id: "${jobId}") {
                            testPlanRun {
                                testPlanReport {
                                    testPlanVersion {
                                        metadata
                                        gitSha
                                    }
                                    at {
                                        name
                                        atVersions {
                                            name
                                        }
                                    }
                                    browser {
                                        name
                                        browserVersions {
                                            name
                                        }
                                    }
                                    runnableTests {
                                        id
                                        rowNumber
                                        scenarios {
                                            id
                                        }
                                        assertions {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                    }
                `,
        { transaction }
      );
      const { collectionJob } = data;
      const { testPlanReport } = collectionJob.testPlanRun;
      const { testPlanVersion } = testPlanReport;

      const browserName = testPlanReport.browser.name;
      const browserVersionName = testPlanReport.browser.browserVersions[0].name;

      const atName = testPlanReport.at.name;
      const { name: atVersionName } = atVersion;
      const { runnableTests } = testPlanReport;

      const isV2 = testPlanVersion.metadata?.testFormatVersion === 2;

      setTimeout(
        () => simulateJobStatusUpdate(jobId, COLLECTION_JOB_STATUS.RUNNING),
        1000
      );

      setTimeout(
        () =>
          simulateResultCompletion(
            runnableTests,
            atName,
            atVersionName,
            browserName,
            browserVersionName,
            jobId,
            0,
            isV2
          ),
        3000
      );
      return res.json({
        id: jobId,
        status: COLLECTION_JOB_STATUS.QUEUED
      });
    }
  });

  app.post('/jobs/:jobID/cancel', (req, res) => {
    return res.json({
      id: req.params.jobID,
      status: COLLECTION_JOB_STATUS.CANCELLED
    });
  });

  app.post('/jobs/:jobID/restart', (req, res) => {
    return res.json({
      id: req.params.jobID,
      status: COLLECTION_JOB_STATUS.QUEUED
    });
  });

  app.get('/jobs/:jobID/log', (req, res) => {
    return res.json({ id: req.params.jobID, log: 'TEST LOG' });
  });

  const tearDown = async () => {
    await new Promise(resolve => {
      shutdownManager.terminate(resolve);
    });
  };

  return {
    tearDown
  };
};

module.exports = setupMockAutomationSchedulerServer;
