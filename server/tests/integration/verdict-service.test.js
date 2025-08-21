const { query, mutate } = require('../util/graphql-test-utilities');
const {
  getAtVersionByQuery
} = require('../../models/services/AtVersionService');
const startSupertestServer = require('../util/api-server');
const automationRoutes = require('../../routes/automation');
const {
  setupMockAutomationSchedulerServer
} = require('../util/mock-automation-scheduler-server');
const db = require('../../models/index');
const {
  getCollectionJobById
} = require('../../models/services/CollectionJobService');

let apiServer;
let sessionAgent;

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

const getReportWithRunsAndMatches = async (id, { transaction }) =>
  await query(
    `
            query {
                testPlanReport(id: "${id}") {
                    id
                    isRerun
                    draftTestPlanRuns {
                        id
                        testResults {
                            id
                            scenarioResults {
                                id
                                output
                                match {
                                    type
                                    source {
                                        testPlanReportId
                                        scenarioId
                                        atVersionName
                                        browserVersionName
                                        output
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `,
    { transaction }
  );

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
                                  assertion { id }
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
                                  assertion { id }
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

const getJobSecret = async (jobId, { transaction }) => {
  const job = await getCollectionJobById({ id: jobId, transaction });
  return job.secret;
};

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

describe('Verdict service', () => {
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
      expect(newTestResult).toBeDefined();
      newTestResult.scenarioResults.forEach(scenarioResult => {
        const matchedHistoricalScenario = historicalResult.scenarioResults.find(
          hs => hs.output === scenarioResult.output
        );
        if (!matchedHistoricalScenario) return;
        const byId = Object.fromEntries(
          matchedHistoricalScenario.assertionResults.map(ar => [
            String(ar.assertion.id),
            ar
          ])
        );
        scenarioResult.assertionResults.forEach(assertionResult => {
          const hist = byId[String(assertionResult.assertion.id)];
          if (hist) {
            expect(assertionResult.passed).toEqual(hist.passed);
            expect(assertionResult.failedReason).toEqual(hist.failedReason);
          }
        });
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

  it('annotates scenario results with SAME_SCENARIO/CROSS_SCENARIO match metadata when outputs match', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const finalReport = await commonVerdictCopyingSetup({ transaction });

      const { testPlanReport } = await getReportWithRunsAndMatches(
        finalReport.id,
        { transaction }
      );

      expect(testPlanReport.isRerun).toBe(true);
      const runs = testPlanReport.draftTestPlanRuns || [];
      expect(runs.length).toBeGreaterThan(0);
      runs.forEach(run => {
        (run.testResults || []).forEach(tr => {
          (tr.scenarioResults || []).forEach(sr => {
            expect(sr.match).toBeDefined();
            expect(sr.match.type).toBe('SAME_SCENARIO');
            expect(sr.match.source).toBeDefined();
            // Matched outputs should be equal
            expect(sr.match.source.output).toBe(sr.output);
            // Basic source sanity
            expect(typeof sr.match.source.atVersionName).toBe('string');
            expect(typeof sr.match.source.browserVersionName).toBe('string');
          });
        });
      });
    });
  });

  it('sets match type NONE with a fallback source when outputs differ', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const finalReport = await commonVerdictCopyingSetup({
        transaction,
        diffOutputs: 1
      });

      const { testPlanReport } = await getReportWithRunsAndMatches(
        finalReport.id,
        { transaction }
      );

      expect(testPlanReport.isRerun).toBe(true);
      const runs = testPlanReport.draftTestPlanRuns || [];
      expect(runs.length).toBeGreaterThan(0);

      let sawNone = false;
      let sawMatch = false;
      runs.forEach(run => {
        (run.testResults || []).forEach(tr => {
          (tr.scenarioResults || []).forEach(sr => {
            expect(sr.match.source).not.toBeNull();
            expect(typeof sr.match.source.output).toBe('string');
            if (sr.match.type === 'NONE') {
              sawNone = true;
              // Fallback source should be provided when NONE
              // eslint-disable-next-line jest/no-conditional-expect
              expect(sr.match.source.testPlanReportId).toBe('29');
            } else {
              sawMatch = true;
              // eslint-disable-next-line jest/no-conditional-expect
              expect(sr.match.type).toBe('SAME_SCENARIO');
            }
          });
        });
      });
      expect(sawNone).toBe(true);
      expect(sawMatch).toBe(true);
    });
  });
});
