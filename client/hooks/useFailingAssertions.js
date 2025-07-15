import { useMemo } from 'react';
import { NEGATIVE_SIDE_EFFECT_ASSERTION_PHRASES } from '../utils/constants';
import getAssertionPhraseOrText from '../utils/getAssertionPhraseOrText';
import summarizeScenario from '../utils/summarizeScenario';

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
              .map(assertionResult => ({
                ...commonResult,
                priority,
                assertionText: getAssertionPhraseOrText(
                  assertionResult.assertion
                ),
                output: scenarioResult.output
              }));
          };

          const assertionResults = scenarioResult.untestable
            ? []
            : [
                ...processPriorityAssertionResults('MUST'),
                ...processPriorityAssertionResults('SHOULD')
              ];

          const unexpectedResults = scenarioResult.unexpectedBehaviors.map(
            unexpectedBehavior => ({
              ...commonResult,
              assertionText:
                unexpectedBehavior.impact.toLowerCase() === 'moderate'
                  ? NEGATIVE_SIDE_EFFECT_ASSERTION_PHRASES.MODERATE
                  : unexpectedBehavior.impact.toLowerCase() === 'severe'
                  ? NEGATIVE_SIDE_EFFECT_ASSERTION_PHRASES.SEVERE
                  : 'N/A',
              priority:
                unexpectedBehavior.impact.toLowerCase() === 'moderate'
                  ? 'SHOULD'
                  : unexpectedBehavior.impact.toLowerCase() === 'severe'
                  ? 'MUST'
                  : 'N/A',
              output: unexpectedBehavior.text
            })
          );
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
