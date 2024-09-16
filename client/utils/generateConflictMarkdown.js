const generateConflictMarkdown = (testPlanReport, test) => {
  const conflicts = testPlanReport.conflicts.filter(
    conflict => conflict.conflictingResults[0].test.id === test.id
  );

  if (conflicts.length === 0) return '';

  const commandString = scenario => {
    return scenario.commands.map(command => command.text).join(' then ');
  };

  const renderConflict = (conflict, index) => {
    const hasUnexpectedBehaviors = conflict.conflictingResults.some(
      result => result.scenarioResult.unexpectedBehaviors.length > 0
    );
    if (hasUnexpectedBehaviors)
      return renderUnexpectedBehaviorConflict(conflict, index);
    return renderAssertionResultConflict(conflict, index);
  };

  const renderAssertionResultConflict = ({ conflictingResults }, index) => {
    const scenario = conflictingResults[0].scenario;
    const command = commandString(scenario);
    const assertion =
      conflictingResults[0].scenarioResult.assertionResults.find(
        ar => !ar.passed
      );
    const assertionText = assertion
      ? assertion.assertion.text
      : 'Unknown assertion';

    const results = conflictingResults
      .map(result => {
        const { testPlanRun, scenarioResult } = result;
        const assertionResult = scenarioResult.assertionResults.find(
          ar => ar.assertion.text === assertionText
        );
        const passed = assertionResult ? assertionResult.passed : false;
        return `* Tester ${testPlanRun.tester.username} recorded output "${
          scenarioResult.output
        }" and marked assertion as ${passed ? 'passing' : 'failing'}.`;
      })
      .join('\n');

    return `
${
  index + 1
}. ### Assertion Results for "${command}" Command and "${assertionText}" Assertion

${results}`;
  };

  const renderUnexpectedBehaviorConflict = ({ conflictingResults }, index) => {
    const scenario = conflictingResults[0].scenario;
    const command = commandString(scenario);

    const results = conflictingResults
      .map(result => {
        const { testPlanRun, scenarioResult } = result;
        let resultFormatted;
        if (scenarioResult.unexpectedBehaviors.length) {
          resultFormatted = scenarioResult.unexpectedBehaviors
            .map(({ text, impact, details }) => {
              return `"${text}" (Details: ${details}, Impact: ${impact})`;
            })
            .join(' and ');
        } else {
          resultFormatted = 'no unexpected behavior';
        }
        return `* Tester ${testPlanRun.tester.username} recorded output "${scenarioResult.output}" and noted ${resultFormatted}.`;
      })
      .join('\n');

    return `
${index + 1}. ### Unexpected Behaviors for "${command}" Command

${results}`;
  };

  return `
## Review Conflicts for "${test.title}"

${conflicts.map(renderConflict).join('\n')}
`;

  // return content.trim();
};

export default generateConflictMarkdown;
