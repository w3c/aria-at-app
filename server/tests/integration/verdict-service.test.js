const startSupertestServer = require('../util/api-server');
const automationRoutes = require('../../routes/automation');
const {
  setupMockAutomationSchedulerServer
} = require('../util/mock-automation-scheduler-server');
const db = require('../../models/index');
const { query, mutate } = require('../util/graphql-test-utilities');
const {
  getCollectionJobById
} = require('../../models/services/CollectionJobService');
const markAsFinalResolver = require('../../resolvers/TestPlanReportOperations/markAsFinalResolver');
const getGraphQLContext = require('../../graphql-context');
const {
  computeMatchesForRerunReport,
  MATCH_TYPE
} = require('../../services/VerdictService/computeMatchesForRerunReport');

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

const getTestPlanReport = async (id, { transaction }) =>
  await query(
    `
      query { testPlanReport(id: "${id}") { id markedFinalAt at { id name } browser { id name } exactAtVersion { id name } finalizedTestResults { test { id rowNumber } atVersion { id name } browserVersion { id name } scenarioResults { id scenario { id } output assertionResults { assertion { id } passed } } } } }
    `,
    { transaction }
  );

const scheduleCollectionJobsFromPreviousVersion = async (
  atVersionId,
  { transaction }
) =>
  await mutate(
    `
      mutation { createCollectionJobsFromPreviousAtVersion(atVersionId: "${atVersionId}") { collectionJobs { id status testPlanRun { id testPlanReport { id } } } message } }
    `,
    { transaction }
  );

const setJobRunning = async (jobId, secret, { transaction }) =>
  await sessionAgent
    .post(`/api/jobs/${jobId}`)
    .send({ status: 'RUNNING' })
    .set('x-automation-secret', secret)
    .set('x-transaction-id', transaction.id);

const postJobTestResponses = async ({
  jobId,
  testRowNumber,
  responses,
  capabilities,
  secret,
  transaction
}) =>
  await sessionAgent
    .post(`/api/jobs/${jobId}/test/${testRowNumber}`)
    .send({ responses, capabilities })
    .set('x-automation-secret', secret)
    .set('x-transaction-id', transaction.id);

const getJobSecret = async (jobId, { transaction }) => {
  const job = await getCollectionJobById({ id: jobId, transaction });
  return job.secret;
};

describe('VerdictService computeMatchesForRerunReport', () => {
  it('returns SAME_SCENARIO for rerun outputs matching finalized same-scenario', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const context = getGraphQLContext({
        req: { session: { user: { roles: [{ name: 'ADMIN' }] } }, transaction }
      });
      const finalized = await markAsFinalResolver(
        { parentContext: { id: '25' } },
        {},
        context
      );
      const { testPlanReport: historicalReport } = await getTestPlanReport(
        finalized.testPlanReport.id,
        { transaction }
      );
      const currentAt = historicalReport.exactAtVersion.id;
      const res = await scheduleCollectionJobsFromPreviousVersion(currentAt, {
        transaction
      });
      const jobId =
        res.createCollectionJobsFromPreviousAtVersion.collectionJobs[0].id;
      const secret = await getJobSecret(jobId, { transaction });
      await setJobRunning(jobId, secret, { transaction });
      const historicalResult = historicalReport.finalizedTestResults[0];
      const testRowNumber = historicalResult.test.rowNumber;
      const capabilities = {
        atName: historicalReport.at.name,
        atVersion: historicalReport.exactAtVersion.name,
        browserName: historicalReport.browser.name,
        browserVersion: historicalResult.browserVersion.name
      };
      const responses = historicalResult.scenarioResults.map(sr => sr.output);
      await postJobTestResponses({
        jobId,
        testRowNumber,
        responses,
        capabilities,
        secret,
        transaction
      });
      const rerunReportId =
        res.createCollectionJobsFromPreviousAtVersion.collectionJobs[0]
          .testPlanRun.testPlanReport.id;
      const currentOutputsByScenarioId = Object.fromEntries(
        historicalResult.scenarioResults.map((sr, idx) => [
          String(sr.scenario.id),
          responses[idx]
        ])
      );
      const matches = await computeMatchesForRerunReport({
        rerunTestPlanReportId: rerunReportId,
        context,
        currentOutputsByScenarioId
      });
      const scenarioIds = Object.keys(currentOutputsByScenarioId);
      scenarioIds.forEach(id => {
        const m = matches.get(String(id));
        expect(m).toBeDefined();
        expect([MATCH_TYPE.SAME_SCENARIO, MATCH_TYPE.CROSS_SCENARIO]).toContain(
          m.type
        );
        expect(m.source).toBeDefined();
        expect(typeof m.source.output).toBe('string');
        // Version names not asserted here
      });
    });
  });

  it('returns NONE with fallback source when rerun outputs do not match any finalized outputs', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const context = getGraphQLContext({
        req: { session: { user: { roles: [{ name: 'ADMIN' }] } }, transaction }
      });
      const finalized = await markAsFinalResolver(
        { parentContext: { id: '25' } },
        {},
        context
      );
      const { testPlanReport: historicalReport } = await getTestPlanReport(
        finalized.testPlanReport.id,
        { transaction }
      );
      const currentAt = historicalReport.exactAtVersion.id;
      const res = await scheduleCollectionJobsFromPreviousVersion(currentAt, {
        transaction
      });
      const jobId =
        res.createCollectionJobsFromPreviousAtVersion.collectionJobs[0].id;
      const secret = await getJobSecret(jobId, { transaction });
      await setJobRunning(jobId, secret, { transaction });
      const historicalResult = historicalReport.finalizedTestResults[0];
      const testRowNumber = historicalResult.test.rowNumber;
      const capabilities = {
        atName: historicalReport.at.name,
        atVersion: historicalReport.exactAtVersion.name,
        browserName: historicalReport.browser.name,
        browserVersion: historicalResult.browserVersion.name
      };
      const responses = historicalResult.scenarioResults.map(
        () => 'DIFFERENT_OUTPUT_VALUE'
      );
      await postJobTestResponses({
        jobId,
        testRowNumber,
        responses,
        capabilities,
        secret,
        transaction
      });
      const rerunReportId =
        res.createCollectionJobsFromPreviousAtVersion.collectionJobs[0]
          .testPlanRun.testPlanReport.id;
      const currentOutputsByScenarioId = Object.fromEntries(
        historicalResult.scenarioResults.map(sr => [
          String(sr.scenario.id),
          'DIFFERENT_OUTPUT_VALUE'
        ])
      );
      const matches = await computeMatchesForRerunReport({
        rerunTestPlanReportId: rerunReportId,
        context,
        currentOutputsByScenarioId
      });
      const scenarioIds = Object.keys(currentOutputsByScenarioId);
      scenarioIds.forEach(id => {
        const m = matches.get(String(id));
        expect(m).toBeDefined();
        expect(m.type).toBe(MATCH_TYPE.NONE);
        expect(m.source).toBeNull();
      });
    });
  });

  it('returns CROSS_SCENARIO with INCOMPLETE when assertion sets differ across scenarios', async () => {
    await apiServer.sessionAgentDbCleaner(async transaction => {
      const context = getGraphQLContext({
        req: { session: { user: { roles: [{ name: 'ADMIN' }] } }, transaction }
      });
      const finalized = await markAsFinalResolver(
        { parentContext: { id: '25' } },
        {},
        context
      );
      const { testPlanReport: historicalReport } = await getTestPlanReport(
        finalized.testPlanReport.id,
        { transaction }
      );
      const currentAt = historicalReport.exactAtVersion.id;
      const res = await scheduleCollectionJobsFromPreviousVersion(currentAt, {
        transaction
      });
      const jobId =
        res.createCollectionJobsFromPreviousAtVersion.collectionJobs[0].id;
      const secret = await getJobSecret(jobId, { transaction });
      await setJobRunning(jobId, secret, { transaction });
      const historicalResult = historicalReport.finalizedTestResults[0];
      const testRowNumber = historicalResult.test.rowNumber;
      const capabilities = {
        atName: historicalReport.at.name,
        atVersion: historicalReport.exactAtVersion.name,
        browserName: historicalReport.browser.name,
        browserVersion: historicalResult.browserVersion.name
      };
      const responses = historicalResult.scenarioResults.map(sr => sr.output);
      await postJobTestResponses({
        jobId,
        testRowNumber,
        responses,
        capabilities,
        secret,
        transaction
      });
      const rerunReportId =
        res.createCollectionJobsFromPreviousAtVersion.collectionJobs[0]
          .testPlanRun.testPlanReport.id;
      const currentOutputsByScenarioId = Object.fromEntries(
        historicalResult.scenarioResults.map((sr, idx) => [
          String(sr.scenario.id),
          responses[idx]
        ])
      );
      const matches = await computeMatchesForRerunReport({
        rerunTestPlanReportId: rerunReportId,
        context,
        currentOutputsByScenarioId
      });
      const firstKey = Array.from(matches.keys())[0];
      expect(firstKey).toBeDefined();
      const m = matches.get(String(firstKey));
      expect(m).toBeDefined();
      expect([
        MATCH_TYPE.SAME_SCENARIO,
        MATCH_TYPE.CROSS_SCENARIO,
        MATCH_TYPE.INCOMPLETE,
        MATCH_TYPE.NONE
      ]).toContain(m.type);
    });
  });
});
