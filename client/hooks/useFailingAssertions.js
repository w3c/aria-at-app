import { useMemo } from 'react';

export const useFailingAssertions = testPlanReport => {
  return useMemo(() => {
    if (!testPlanReport?.finalizedTestResults) {
      return [];
    }

    const failingAssertions = testPlanReport.finalizedTestResults.flatMap(
      (testResult, testIndex) => {
        return testResult.scenarioResults.flatMap(scenarioResult => {
          const commonResult = {
            testResultId: testResult.id,
            testIndex,
            testTitle: testResult.test.title,
            scenarioCommands: scenarioResult.scenario.commands
              .map((cmd, index) => {
                if (index === scenarioResult.scenario.commands.length - 1) {
                  return cmd.text;
                }
                // Prevent instances of duplicated setting in brackets.
                // eg. Down Arrow (virtual cursor active) then Down Arrow (virtual cursor active)
                //
                // Expectation is Down Arrow then Down Arrow (virtual cursor active), because the setting will always be
                // the same for the listed key combination.
                //
                // Some revision of how that key combination + setting is rendered may be useful
                return cmd.text.split(' (')[0];
              })
              .join(' then '),
            commandId: `${
              scenarioResult.scenario.id
            }_${scenarioResult.scenario.commands.map(cmd => cmd.id).join('_')}`
          };

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
                assertionText: assertionResult.assertion.text,
                output: scenarioResult.output
              }));
          };

          const assertionResults = [
            ...processPriorityAssertionResults('MUST'),
            ...processPriorityAssertionResults('SHOULD')
          ];

          const unexpectedResults = scenarioResult.unexpectedBehaviors.map(
            unexpectedBehavior => ({
              ...commonResult,
              assertionText:
                unexpectedBehavior.impact.toLowerCase() === 'moderate'
                  ? 'Moderate negative side effects do not occur'
                  : unexpectedBehavior.impact.toLowerCase() === 'severe'
                  ? 'Severe negative side effects do not occur'
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
