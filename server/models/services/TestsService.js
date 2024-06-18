const ats = require('../../resources/ats.json');
const {
  getCommandV1,
  getCommandV2
} = require('../../resolvers/helpers/retrieveCommands');

const getTests = parentRecord => {
  const isTestPlanVersion = !!parentRecord.tests;
  const testPlanReport = isTestPlanVersion ? null : parentRecord;
  const testPlanVersion = isTestPlanVersion
    ? parentRecord
    : testPlanReport.testPlanVersion;
  const inferredAtId = testPlanReport?.atId;
  const isV2 = testPlanVersion.metadata?.testFormatVersion === 2;

  // Populate nested At and Command fields
  return testPlanVersion.tests.map(test => ({
    ...test,
    inferredAtId, // Not available in GraphQL, but used by child resolvers
    ats: test.atIds.map(atId => ats.find(at => at.id === atId)),
    scenarios: test.scenarios.map(scenario => {
      const at = ats.find(at => at.id === scenario.atId);
      return {
        ...scenario,
        at,
        commands: scenario.commandIds.map(commandId => {
          if (isV2) {
            const screenText = at?.settings[scenario.settings]?.screenText;
            const commandKVs = getCommandV2(commandId);
            if (commandKVs.length) {
              // `scenario` has an identifier to the settings being displayed.
              // May be best to display the settings text instead, ie.
              // 'PC cursor active' instead of having the client evaluate 'pcCursor'
              return {
                id: commandKVs[0].key,
                text: `${commandKVs[0].value}${
                  screenText ? ` (${screenText})` : ''
                }`,
                atOperatingMode: scenario.settings
              };
            }
            return { id: '', text: '' };
          }

          // Return V1 command
          return getCommandV1(commandId);
        })
      };
    }),
    assertions: test.assertions.map(assertion => ({
      ...assertion,
      text: isV2 ? assertion.assertionStatement : assertion.text,
      phrase: isV2 ? assertion.assertionPhrase : null
    }))
  }));
};

module.exports = getTests;
