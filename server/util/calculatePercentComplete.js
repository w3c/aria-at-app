const {
  getTestPlanReportById
} = require('../models/services/TestPlanReportService');

const calculatePercentComplete = async ({ testPlanReportId, transaction }) => {
  if (!testPlanReportId) return 0;

  try {
    const testPlanReport = await getTestPlanReportById({
      id: testPlanReportId,
      testPlanReportAttributes: ['id', 'atId'],
      testPlanRunAttributes: ['id', 'testResults'],
      testPlanVersionAttributes: ['id', 'tests', 'metadata'],
      testPlanAttributes: [],
      atAttributes: [],
      browserAttributes: [],
      userAttributes: [],
      transaction
    });

    if (
      !testPlanReport ||
      !testPlanReport.testPlanRuns ||
      !testPlanReport.testPlanRuns.length
    )
      return 0;

    const runnableTests = testPlanReport.testPlanVersion.tests.filter(test =>
      test.atIds.includes(testPlanReport.atId)
    );

    let totalAssertionsPossible = 0;
    let totalValidatedAssertions = 0;

    if (runnableTests && runnableTests.length) {
      runnableTests.forEach(test => {
        if (test.assertions) {
          totalAssertionsPossible += test.assertions.length;
        }
      });
    }

    testPlanReport.testPlanRuns.forEach(draftTestPlanRun => {
      if (!draftTestPlanRun.testResults) return;

      draftTestPlanRun.testResults.forEach(test => {
        if (!test.scenarioResults) return;

        test.scenarioResults.forEach(scenario => {
          if (!scenario.assertionResults) return;

          scenario.assertionResults.forEach(assertion => {
            if (assertion.passed !== null) {
              totalValidatedAssertions++;
            }
          });
        });
      });
    });

    if (totalAssertionsPossible === 0) return 0;

    const percentage =
      (totalValidatedAssertions / totalAssertionsPossible) * 100;
    if (isNaN(percentage) || !isFinite(percentage)) return 0;
    return Math.min(Math.floor(percentage), 100);
  } catch (error) {
    console.error(
      `Error calculating percentComplete for TestPlanReport ${testPlanReportId}:`,
      error
    );
    return 0;
  }
};

module.exports = { calculatePercentComplete };
