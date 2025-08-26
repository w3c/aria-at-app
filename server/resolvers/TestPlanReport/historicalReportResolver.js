const {
  getTestPlanReportById
} = require('../../models/services/TestPlanReportService');

const historicalReportResolver = async (
  testPlanReport,
  args, // eslint-disable-line no-unused-vars
  context
) => {
  const { transaction } = context;

  if (!testPlanReport.historicalReportId) {
    return null;
  }

  return getTestPlanReportById({
    id: testPlanReport.historicalReportId,
    transaction
  });
};

module.exports = historicalReportResolver;
