import { useMemo } from 'react';

export const useFailingAssertions = testPlanReport => {
  return useMemo(() => {
    if (!testPlanReport?.finalizedTestResults) {
      return [];
    }

    return testPlanReport.finalizedTestResults.flatMap(
      (testResult, testIndex) => {
        return testResult.scenarioResults.flatMap(scenarioResult => {
          return (
            scenarioResult.assertionResults
              .filter(assertionResult => !assertionResult.passed)
              // We only want to show MUST and SHOULD assertions
              .filter(
                assertionResult =>
                  assertionResult.assertion.priority !== 'MAY' &&
                  assertionResult.assertion.priority !== 'EXCLUDE'
              )
              .map(assertionResult => ({
                testResultId: testResult.id,
                testIndex,
                testTitle: testResult.test.title,
                scenarioCommands: scenarioResult.scenario.commands
                  .map(cmd => cmd.text)
                  .join(', '),
                assertionText: assertionResult.assertion.text,
                priority: assertionResult.assertion.priority,
                output: scenarioResult.output
              }))
          );
        });
      }
    );
  }, [testPlanReport]);
};
