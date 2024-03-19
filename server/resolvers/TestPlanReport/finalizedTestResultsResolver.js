const testResultsResolver = require('../TestPlanRun/testResultsResolver');

const finalizedTestResultsResolver = async (testPlanReport, _, context) => {
  if (!testPlanReport.testPlanRuns.length) {
    return null;
  }

  // Since conflicts are now resolved, all testPlanRuns are interchangeable.
  const testPlanRun = testPlanReport.testPlanRuns[0];

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
