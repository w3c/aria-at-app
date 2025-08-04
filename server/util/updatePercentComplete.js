const { calculatePercentComplete } = require('./calculatePercentComplete');
const {
  getTestPlanReportById,
  updateTestPlanReportById
} = require('../models/services/TestPlanReportService');
const runnableTestsResolver = require('../resolvers/TestPlanReport/runnableTestsResolver');
const getGraphQLContext = require('../graphql-context');
const populateData = require('../services/PopulatedData/populateData');

const updatePercentComplete = async ({ testPlanReportId, transaction }) => {
  if (!testPlanReportId) return;

  try {
    const testPlanReport = await getTestPlanReportById({
      id: testPlanReportId,
      testPlanReportAttributes: ['id', 'percentComplete', 'atId'],
      testPlanRunAttributes: ['id', 'testResults'],
      testPlanVersionAttributes: ['id', 'tests'],
      testPlanAttributes: [],
      atAttributes: [],
      browserAttributes: [],
      userAttributes: [],
      transaction
    });

    if (!testPlanReport) return;

    const context = getGraphQLContext({ req: { transaction } });

    const { testPlanReport: populatedTestPlanReport } = await populateData(
      { testPlanReportId },
      { context }
    );

    const runnableTests = runnableTestsResolver(
      populatedTestPlanReport,
      null,
      context
    );

    const percentComplete = calculatePercentComplete({
      draftTestPlanRuns: testPlanReport.testPlanRuns,
      runnableTests,
      atId: testPlanReport.atId
    });

    if (testPlanReport.percentComplete !== percentComplete) {
      await updateTestPlanReportById({
        id: testPlanReportId,
        values: { percentComplete },
        testPlanReportAttributes: ['id'],
        testPlanRunAttributes: [],
        testPlanVersionAttributes: [],
        testPlanAttributes: [],
        atAttributes: [],
        browserAttributes: [],
        userAttributes: [],
        transaction
      });
    }
  } catch (error) {
    console.error(
      `Error updating percentComplete for TestPlanReport ${testPlanReportId}:`,
      error
    );
  }
};

module.exports = { updatePercentComplete };
