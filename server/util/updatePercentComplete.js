const { calculatePercentComplete } = require('./calculatePercentComplete');
const {
  updateTestPlanReportById
} = require('../models/services/TestPlanReportService');

const updatePercentComplete = async ({ testPlanReportId, transaction }) => {
  if (!testPlanReportId) return;

  try {
    const percentComplete = await calculatePercentComplete({
      testPlanReportId,
      transaction
    });

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
  } catch (error) {
    console.error(
      `Error updating percentComplete for TestPlanReport ${testPlanReportId}:`,
      error
    );
  }
};

module.exports = { updatePercentComplete };
