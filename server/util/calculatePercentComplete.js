const {
  computeTotalPossibleAssertions
} = require('./computeTotalPossibleAssertions');

/**
 * Calculate the percent complete for a given set of tests and an AT ID.
 * Uses the assertions complete / total possible assertions formula.
 *
 * @param {TestPlanRun[]} draftTestPlanRuns Draft test plan runs to calculate percent complete
 * @param {Test[]} runnableTests Tests to calculate percent complete for
 * @param {string} atId AT ID to calculate percent complete
 * @returns {number} Percent complete
 */
const calculatePercentComplete = ({
  draftTestPlanRuns,
  runnableTests,
  atId
}) => {
  if (!runnableTests || !runnableTests.length) return 0;

  const baseAssertionsPossible = computeTotalPossibleAssertions(
    runnableTests,
    atId
  );
  let totalAssertionsPossible =
    baseAssertionsPossible * draftTestPlanRuns.length;
  let totalValidatedAssertions = 0;

  if (draftTestPlanRuns && draftTestPlanRuns.length) {
    draftTestPlanRuns.forEach(draftTestPlanRun => {
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
  }

  if (totalAssertionsPossible === 0) return 0;

  const percentage = (totalValidatedAssertions / totalAssertionsPossible) * 100;
  if (isNaN(percentage) || !isFinite(percentage)) return 0;
  return Math.floor(percentage);
};

module.exports = {
  calculatePercentComplete
};
