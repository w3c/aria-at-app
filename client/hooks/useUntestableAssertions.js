import { useMemo } from 'react';
import summarizeScenario from '../utils/summarizeScenario';

/**
 * @typedef {Object} UntestableAssertion
 * @property {string} testResultId - Test result ID
 * @property {number} testIndex - Test index
 * @property {string} testTitle - Test title
 * @property {string} scenarioCommands - Scenario commands
 * @property {string} commandId - Command ID
 * @property {'MUST'|'SHOULD'|'MAY'} priority - Priority level
 * @property {string} assertionText - The assertion text
 * @property {string} output - Scenario output
 */

/**
 * Hook to extract all untestable assertions from a test plan report's finalized test results.
 * Only includes assertions from scenarios marked as untestable, including MUST, SHOULD, and MAY priorities.
 *
 * @param {Object} testPlanReport - The test plan report object containing finalizedTestResults
 * @returns {Array<UntestableAssertion>} Array of untestable assertion objects
 */
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
