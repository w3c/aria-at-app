const { COLLECTION_JOB_STATUS } = require('../../util/enums');
const { default: axios } = require('axios');
const { gql } = require('apollo-server-core');

// 0 = no chance of test errors, 1 = always errors
const TEST_ERROR_CHANCE = 0;

let apolloServer, axiosConfig;

const timeout = ms => new Promise(resolve => setTimeout(() => resolve(), ms));
let mockSchedulerEnabled = false;
const setupMockAutomationSchedulerServer = async () => {
  mockSchedulerEnabled = true;
  axiosConfig = require('../../controllers/AutomationController').axiosConfig;
  apolloServer = require('../../graphql-server');
};

const simulateJobStatusUpdate = async (jobId, newStatus, headers) => {
  if (!mockSchedulerEnabled) throw new Error('mock scheduler is not enabled');
  try {
    await axios.post(
      `${process.env.APP_SERVER}/api/jobs/${jobId}`,
      {
        status: newStatus
      },
      {
        ...axiosConfig,
        headers
      }
    );
  } catch (err) {
    console.error('error delivering mock job status update', err);
  }
};

const simulateTestStatusUpdate = async (jobId, testId, newStatus, headers) => {
  if (!mockSchedulerEnabled) throw new Error('mock scheduler is not enabled');
  try {
    await axios.post(
      `${process.env.APP_SERVER}/api/jobs/${jobId}/test/${testId}`,
      {
        status: newStatus
      },
      {
        ...axiosConfig,
        headers
      }
    );
  } catch (err) {
    console.error('error delivering mock data', err);
  }
};

const simulateResultCompletion = async (
  tests,
  atName,
  atVersionName,
  browserName,
  browserVersionName,
  jobId,
  currentTestIndex,
  isV2,
  headers
) => {
  if (!mockSchedulerEnabled) throw new Error('mock scheduler is not enabled');
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
      COLLECTION_JOB_STATUS.RUNNING,
      headers
    );
    await timeout(Math.random() * 2000);

    if (Math.random() < TEST_ERROR_CHANCE) {
      await simulateTestStatusUpdate(
        jobId,
        currentTest.rowNumber,
        COLLECTION_JOB_STATUS.ERROR,
        headers
      );
      return simulateJobStatusUpdate(
        jobId,
        COLLECTION_JOB_STATUS.ERROR,
        headers
      );
    } else {
      await axios.post(
        `${process.env.APP_SERVER}/api/jobs/${jobId}/test/${currentTest.rowNumber}`,
        testResult,
        {
          ...axiosConfig,
          headers
        }
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
        isV2,
        headers
      );
    } else {
      simulateJobStatusUpdate(jobId, COLLECTION_JOB_STATUS.COMPLETED, headers);
    }
  } catch (error) {
    console.error('Error simulating collection job', error);
  }
};

const startCollectionJobSimulation = async (
  job,
  testIds,
  atVersion,
  transaction
) => {
  if (!mockSchedulerEnabled) throw new Error('mock scheduler is not enabled');
  if (process.env.ENVIRONMENT === 'test') {
    // stub behavior in test suite

    startCollectionJobSimulation.lastCallParams = { job, testIds, atVersion };

    return { status: COLLECTION_JOB_STATUS.QUEUED };
  } else {
    const { data } = await apolloServer.executeOperation(
      {
        query: gql`
          query {
              collectionJob(id: "${job.id}") {
                  id
                  testPlanRun {
                      testPlanReport {
                          testPlanVersion {
                              metadata
                              gitSha
                          }
                          exactAtVersion {
                              name
                              id
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
          }`
      },
      { req: { transaction } }
    );
    const headers = {
      'x-automation-secret': job.secret
    };
    const { collectionJob } = data;
    const jobId = collectionJob.id;
    const { testPlanReport } = collectionJob.testPlanRun;
    const { testPlanVersion } = testPlanReport;

    const browserName = testPlanReport.browser.name;
    const browserVersionName = testPlanReport.browser.browserVersions[0].name;

    const atName = testPlanReport.at.name;

    if (!atVersion || !atVersion.name) {
      atVersion = testPlanReport.exactAtVersion;
    }

    const { name: atVersionName } = atVersion;

    const { runnableTests } = testPlanReport;

    const isV2 = testPlanVersion.metadata?.testFormatVersion === 2;

    setTimeout(
      () =>
        simulateJobStatusUpdate(jobId, COLLECTION_JOB_STATUS.RUNNING, headers),
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
          isV2,
          headers
        ),
      3000
    );
    return {
      id: jobId,
      status: COLLECTION_JOB_STATUS.QUEUED
    };
  }
};

module.exports = {
  setupMockAutomationSchedulerServer,
  startCollectionJobSimulation
};
