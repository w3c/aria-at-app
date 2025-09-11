const hasExceptionWithPriority = (assertion, scenario, priority) => {
  return assertion.assertionExceptions?.some(
    exception =>
      scenario.commands.find(
        command =>
          command.id === exception.commandId &&
          command.atOperatingMode === exception.settings
      ) && exception.priority === priority
  );
};

const computeTotalPossibleAssertionsBase = (runnableTests, atId) => {
  if (!runnableTests || !runnableTests.length) return 0;

  let totalAssertionsPossible = 0;
  runnableTests.forEach(test => {
    if (!test.scenarios || !test.assertions) return;

    const scenariosForAt = test.scenarios.filter(
      scenario => scenario.at.id === atId
    );

    scenariosForAt.forEach(scenario => {
      const filteredAssertions = test.assertions.filter(
        assertion => !hasExceptionWithPriority(assertion, scenario, 'EXCLUDE')
      );
      totalAssertionsPossible += filteredAssertions.length;
    });
  });

  return totalAssertionsPossible;
};

const calculatePercentComplete = ({
  draftTestPlanRuns,
  runnableTests,
  atId
}) => {
  if (!runnableTests || !runnableTests.length) return 0;

  const baseAssertionsPossible = computeTotalPossibleAssertionsBase(
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
  calculatePercentComplete,
  computeTotalPossibleAssertionsBase
};
