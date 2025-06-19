import { useMemo } from 'react';
import summarizeScenario from '../utils/summarizeScenario';

export const useUntestableAssertions = testPlanReport => {
  return useMemo(() => {
    if (!testPlanReport?.finalizedTestResults) {
      return [];
    }

    return testPlanReport.finalizedTestResults.flatMap(
      (testResult, testIndex) => {
        return testResult.scenarioResults.flatMap(scenarioResult => {
          const commonResult = summarizeScenario(
            testResult,
            testIndex,
            scenarioResult
          );

          /**
           * @param {'MUST'|'SHOULD'|'MAY'} priority
           * @return {object[]}
           */
          const processPriorityAssertionResults = priority => {
            return scenarioResult[
              `${priority.toLowerCase()}AssertionResults`
            ].map(assertionResult => ({
              ...commonResult,
              priority,
              assertionText: assertionResult.assertion.text,
              output: scenarioResult.output
            }));
          };

          return !scenarioResult.untestable
            ? []
            : [
                ...processPriorityAssertionResults('MUST'),
                ...processPriorityAssertionResults('SHOULD'),
                ...processPriorityAssertionResults('MAY')
              ];
        });
      }
    );
  }, [testPlanReport]);
};
