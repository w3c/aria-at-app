import { useMemo } from 'react';
import { NEGATIVE_SIDE_EFFECT_ASSERTION_PHRASES } from '../utils/constants';
import getAssertionPhraseOrText from '../utils/getAssertionPhraseOrText';
import summarizeScenario from '../utils/summarizeScenario';

/**
 * @typedef {Object} FailingAssertion
 * @property {string} testResultId - Test result ID
 * @property {number} testIndex - Test index
 * @property {string} testTitle - Test title
 * @property {string} scenarioCommands - Scenario commands
 * @property {string} commandId - Command ID
 * @property {'MUST'|'SHOULD'|'N/A'} priority - Priority level
 * @property {string} assertionText - The assertion phrase or text
 * @property {string} output - Scenario output or negative side effect text
 * @property {string} [assertionId] - The assertion ID (for regular assertions)
 * @property {Array} assertionAtBugs - Array of bugs filtered by commandId
 * @property {boolean} [isNegativeSideEffect] - True if this is a negative side effect
 * @property {string} [negativeSideEffectId] - Negative side effect ID
 * @property {string} [negativeSideEffectImpact] - Impact level
 * @property {string} [negativeSideEffectDetails] - Negative side effect details
 * @property {number} [uniqueCommandsCount] - Number of unique command sequences with failures (added to array)
 * @property {number} [uniqueAssertionStatementsCount] - Number of unique assertion statements (added to array)
 * @property {number} [totalAssertionsCount] - Total number of assertions including implicit ones (added to array)
 */

/**
 * Hook to extract and process all failing assertions from a test plan report's
 * finalized test results. Includes both failed MUST/SHOULD assertions and negative
 * side effects. Filters bugs by commandId for each assertion. Adds statistics
 * properties to the returned array.
 *
 * @param {Object} testPlanReport - The test plan report object containing finalizedTestResults
 * @returns {Array<FailingAssertion>} Array of failing assertion objects
 */
export const useFailingAssertions = testPlanReport => {
  return useMemo(() => {
    if (!testPlanReport?.finalizedTestResults) {
      return [];
    }

    const failingAssertions = testPlanReport.finalizedTestResults.flatMap(
      (testResult, testIndex) => {
        return testResult.scenarioResults.flatMap(scenarioResult => {
          const commonResult = summarizeScenario(
            testResult,
            testIndex,
            scenarioResult
          );

          /**
           * @param {'MUST'|'SHOULD'} priority
           * @return {object[]}
           */
          const processPriorityAssertionResults = priority => {
            return scenarioResult[`${priority.toLowerCase()}AssertionResults`]
              .filter(assertionResult => !assertionResult.passed)
              .map(assertionResult => {
                // Filter bugs by commandId to only show bugs linked to this specific command
                const allBugs = assertionResult.assertion.atBugs || [];
                const filteredBugs = allBugs.filter(bug => {
                  // If bug has commandIds array, check if it includes this commandId
                  if (bug.commandIds && Array.isArray(bug.commandIds)) {
                    return bug.commandIds.includes(commonResult.commandId);
                  }
                  return false;
                });

                return {
                  ...commonResult,
                  priority,
                  assertionText: getAssertionPhraseOrText(
                    assertionResult.assertion
                  ),
                  output: scenarioResult.output,
                  assertionId: assertionResult.assertion.id,
                  assertionAtBugs: filteredBugs,
                  atVersionName: testResult?.atVersion?.name || null,
                  browserVersionName: testResult?.browserVersion?.name || null
                };
              });
          };

          const assertionResults = scenarioResult.untestable
            ? []
            : [
                ...processPriorityAssertionResults('MUST'),
                ...processPriorityAssertionResults('SHOULD')
              ];

          const unexpectedResults = (
            scenarioResult.negativeSideEffects || []
          ).map(negativeSideEffect => {
            return {
              ...commonResult,
              assertionText:
                negativeSideEffect.impact.toLowerCase() === 'moderate'
                  ? NEGATIVE_SIDE_EFFECT_ASSERTION_PHRASES.MODERATE
                  : negativeSideEffect.impact.toLowerCase() === 'severe'
                  ? NEGATIVE_SIDE_EFFECT_ASSERTION_PHRASES.SEVERE
                  : 'N/A',
              priority:
                negativeSideEffect.impact.toLowerCase() === 'moderate'
                  ? 'SHOULD'
                  : negativeSideEffect.impact.toLowerCase() === 'severe'
                  ? 'MUST'
                  : 'N/A',
              output: negativeSideEffect.text,
              // Add fields to identify this as a negative side effect for bug linking
              isNegativeSideEffect: true,
              negativeSideEffectId: negativeSideEffect.encodedId,
              negativeSideEffectImpact: negativeSideEffect.impact,
              negativeSideEffectDetails: negativeSideEffect.details,
              // Include any existing bug links from the negative side effect
              assertionAtBugs: negativeSideEffect.atBugs || []
            };
          });
          return [...assertionResults, ...unexpectedResults];
        });
      }
    );

    const uniqueCommandsWithFailures = new Set(
      failingAssertions.map(a => a.scenarioCommands)
    );
    failingAssertions.uniqueCommandsCount = uniqueCommandsWithFailures.size;

    const uniqueAssertionStatements = new Set(
      failingAssertions.map(a => a.assertionText)
    );
    failingAssertions.uniqueAssertionStatementsCount =
      uniqueAssertionStatements.size;

    // NOTE: Each command has 2 additional assertions:
    // * Other behaviors that create severe negative impact
    // * Other behaviors that create moderate negative impact
    // TODO: Include this from the db assertions now that this has been agreed upon
    const OTHER_BEHAVIOR_SEVERE_PER_COMMAND_COUNT = 1;
    const OTHER_BEHAVIOR_MODERATE_PER_COMMAND_COUNT = 1;

    let totalAssertionsCount = 0;
    if (testPlanReport?.finalizedTestResults) {
      testPlanReport.finalizedTestResults.forEach(testResult => {
        testResult.scenarioResults.forEach(scenarioResult => {
          totalAssertionsCount +=
            scenarioResult.mustAssertionResults.length +
            OTHER_BEHAVIOR_SEVERE_PER_COMMAND_COUNT +
            scenarioResult.shouldAssertionResults.length +
            OTHER_BEHAVIOR_MODERATE_PER_COMMAND_COUNT;
        });
      });
    }
    failingAssertions.totalAssertionsCount = totalAssertionsCount;

    return failingAssertions;
  }, [testPlanReport]);
};
