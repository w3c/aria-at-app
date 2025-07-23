export const calculatePercentComplete = ({ metrics, draftTestPlanRuns }) => {
  if (!metrics || !draftTestPlanRuns) return 0;

  let totalAssertionsPossible = 0;
  let totalValidatedAssertions = 0;

  draftTestPlanRuns.forEach(draftTestPlanRun => {
    draftTestPlanRun.testResults.forEach(test => {
      test.scenarioResults.forEach(scenario => {
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
