const generateConflictMarkdown = (testPlanReport, test) => {
  const conflicts = testPlanReport.conflicts.filter(
    conflict => conflict.conflictingResults[0].test.id === test.id
  );

  if (conflicts.length === 0) return '';

  const commandString = scenario => {
    return scenario.commands.map(command => command.text).join(' then ');
  };

  const renderConflict = (conflict, index) => {
    const assertion = conflict.source.assertion;
    if (assertion) return renderAssertionResultConflict(conflict, index);
    return renderNegativeSideEffectConflict(conflict, index);
  };

  const renderAssertionResultConflict = (
    { source: { scenario, assertion }, conflictingResults },
    index
  ) => {
    const command = commandString(scenario);
    const assertionText = assertion ? assertion.text : 'Unknown assertion';

    const results = conflictingResults
      .map(result => {
        const { testPlanRun, scenarioResult } = result;
        const assertionResult = scenarioResult.assertionResults.find(
          ar => ar.assertion.text === assertionText
        );
        const passed = assertionResult ? assertionResult.passed : false;
        return `* Tester ${testPlanRun.tester.username} recorded output "${
          scenarioResult.output
        }" and marked assertion as ${
          scenarioResult.untestable
            ? 'untestable'
            : passed
            ? 'passing'
            : 'failing'
        }.`;
      })
      .join('\n');

    return `
${
  index + 1
}. ### Assertion Results for "${command}" Command and "${assertionText}" Assertion

${results}`;
  };

  const renderNegativeSideEffectConflict = (
    { source: { scenario }, conflictingResults },
    index
  ) => {
    const command = commandString(scenario);

    const results = conflictingResults
      .map(result => {
        const { testPlanRun, scenarioResult } = result;
        let resultFormatted;
        if (scenarioResult.negativeSideEffects.length) {
          resultFormatted = scenarioResult.negativeSideEffects
            .map(({ text, impact, details }) => {
              return `"${text}" (Details: ${details}, Impact: ${impact})`;
            })
            .join(' and ');
          if (scenarioResult.untestable)
            resultFormatted = `${resultFormatted} and marked the assertions as untestable`;
        } else {
          resultFormatted = 'no negative side effect';
        }
        return `* Tester ${testPlanRun.tester.username} recorded output "${scenarioResult.output}" and noted ${resultFormatted}.`;
      })
      .join('\n');

    return `
${index + 1}. ### Negative Side Effects for "${command}" Command

${results}`;
  };

  return `
## Review Conflicts for "${test.title}"

${conflicts.map(renderConflict).join('\n')}
`;

  // return content.trim();
};

export default generateConflictMarkdown;
