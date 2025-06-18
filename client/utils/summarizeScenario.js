export default (testResult, testIndex, scenarioResult) => ({
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
  commandId: `${scenarioResult.scenario.id}_${scenarioResult.scenario.commands
    .map(cmd => cmd.id)
    .join('_')}`
});
