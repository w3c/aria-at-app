const calculatePercentComplete = ({ draftTestPlanRuns }) => {
  if (!draftTestPlanRuns || !draftTestPlanRuns.length) return 0;

  let totalAssertionsPossible = 0;
  let totalValidatedAssertions = 0;

  draftTestPlanRuns.forEach(draftTestPlanRun => {
    if (!draftTestPlanRun.testResults) return;

    draftTestPlanRun.testResults.forEach(test => {
      if (!test.scenarioResults) return;

      test.scenarioResults.forEach(scenario => {
        if (!scenario.assertionResults) return;

        scenario.assertionResults.forEach(assertion => {
          totalAssertionsPossible++;
          if (assertion.passed !== null) {
            totalValidatedAssertions++;
          }
        });
      });
    });
  });

  if (totalAssertionsPossible === 0) return 0;

  const percentage = (totalValidatedAssertions / totalAssertionsPossible) * 100;
  if (isNaN(percentage) || !isFinite(percentage)) return 0;
  return Math.floor(percentage);
};

module.exports = { calculatePercentComplete };
