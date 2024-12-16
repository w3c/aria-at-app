import { useMemo } from 'react';

export const useFailingAssertions = testPlanReport => {
  return useMemo(() => {
    if (!testPlanReport?.finalizedTestResults) {
      return [];
    }

    return testPlanReport.finalizedTestResults.flatMap(testResult => {
      return testResult.scenarioResults.flatMap(scenarioResult => {
        return scenarioResult.assertionResults
          .filter(assertionResult => !assertionResult.passed)
          .map(assertionResult => ({
            testTitle: testResult.test.title,
            scenarioCommands: scenarioResult.scenario.commands
              .map(cmd => cmd.text)
              .join(', '),
            assertionText: assertionResult.assertion.text,
            priority: assertionResult.assertion.priority,
            output: scenarioResult.output
          }));
      });
    });
  }, [testPlanReport]);
};
