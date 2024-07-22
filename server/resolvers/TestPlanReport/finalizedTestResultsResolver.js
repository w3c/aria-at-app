const testResultsResolver = require('../TestPlanRun/testResultsResolver');

const finalizedTestResultsResolver = async (testPlanReport, _, context) => {
  if (!testPlanReport.testPlanRuns.length) {
    return null;
  }

  // Return the primary test plan run, otherwise pick the first TestPlanRun found.
  const testPlanRun =
    testPlanReport.testPlanRuns.find(({ isPrimary }) => isPrimary) ||
    testPlanReport.testPlanRuns[0];

  return testResultsResolver(
    {
      testPlanReport,
      testResults: testPlanRun.testResults.filter(
        testResult => !!testResult.completedAt
      )
    },
    null,
    context
  );
};

module.exports = finalizedTestResultsResolver;
