const { calculatePercentComplete } = require('./calculatePercentComplete');
const {
  getTestPlanReportById,
  updateTestPlanReportById
} = require('../models/services/TestPlanReportService');

const updatePercentComplete = async ({ testPlanReportId, transaction }) => {
  if (!testPlanReportId) return;

  try {
    const testPlanReport = await getTestPlanReportById({
      id: testPlanReportId,
      testPlanReportAttributes: ['id', 'percentComplete'],
      testPlanRunAttributes: ['id', 'testResults'],
      testPlanVersionAttributes: [],
      testPlanAttributes: [],
      atAttributes: [],
      browserAttributes: [],
      userAttributes: [],
      transaction
    });

    if (!testPlanReport) return;

    const percentComplete = calculatePercentComplete({
      draftTestPlanRuns: testPlanReport.testPlanRuns
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
