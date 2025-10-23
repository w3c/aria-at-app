const totalScenarioCountResolver = testPlanReport => {
  if (!testPlanReport.testPlanVersion?.tests) {
    return 0;
  }

  const tests = testPlanReport.testPlanVersion.tests;
  const atId = testPlanReport.atId;

  let totalScenarios = 0;
  tests.forEach(test => {
    if (test.atIds && test.atIds.includes(atId)) {
      if (Array.isArray(test.scenarios)) {
        totalScenarios += test.scenarios.length;
      }
    }
  });

  return totalScenarios;
};

module.exports = totalScenarioCountResolver;
