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
                  ? 'Other behaviors that create moderate negative impacts are not exhibited'
                  : unexpectedBehavior.impact.toLowerCase() === 'severe'
                  ? 'Other behaviors that create severe negative impacts are not exhibited'
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
      failingAssertions.map(a => a.commandId)
    );
    failingAssertions.uniqueCommandsCount = uniqueCommandsWithFailures.size;

    return failingAssertions;
  }, [testPlanReport]);
};
