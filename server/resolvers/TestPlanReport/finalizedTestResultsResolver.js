const testResultsResolver = require('../TestPlanRun/testResultsResolver');
const { getTestPlanRuns } = require('../../models/services/TestPlanRunService');

const finalizedTestResultsResolver = async (testPlanReport, _, context) => {
  const { transaction } = context;

  // Fetch testPlanRuns for this report
  const testPlanRuns = await getTestPlanRuns({
    where: { testPlanReportId: testPlanReport.id },
    transaction
  });

  if (!testPlanRuns.length) {
    return null;
  }

  // Return the primary test plan run, otherwise pick the first TestPlanRun found.
  const testPlanRun =
    testPlanRuns.find(({ isPrimary }) => isPrimary) ||
    testPlanRuns.find(testPlanRun =>
      testPlanRun.testResults?.some(testResult => !!testResult.completedAt)
    ) ||
    testPlanRuns[0];

  const testPlanRunForResolver = {
    ...testPlanRun.dataValues,
    testPlanReport,
    testResults: testPlanRun.testResults.filter(
      testResult => !!testResult.completedAt
    )
  };

  return testResultsResolver(testPlanRunForResolver, null, context);
};

module.exports = finalizedTestResultsResolver;
