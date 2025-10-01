const {
  getTestPlanReportById
} = require('../../models/services/TestPlanReportService');

const isRerunResolver = async (
  testPlanReport,
  args, // eslint-disable-line no-unused-vars
  context // eslint-disable-line no-unused-vars
) => {
  const hasRerunInRuns = report =>
    Array.isArray(report.testPlanRuns) &&
    report.testPlanRuns.some(run => !!run.isRerun);

  // If testPlanRuns were already populated with runs, use them
  if (hasRerunInRuns(testPlanReport)) {
    return true;
  }

  // Otherwise, load report with nested runs to check for isRerun
  const { transaction } = context || {};
  const loaded = await getTestPlanReportById({
    id: testPlanReport.id,
    transaction
  });
  return hasRerunInRuns(loaded);
};

module.exports = isRerunResolver;
