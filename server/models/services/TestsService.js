const ats = require('../../resources/ats.json');
const support = require('../../resources/support.json');
const {
  getCommandV1,
  getCommandV2
} = require('../../resolvers/helpers/retrieveCommands');

const {
  references: { aria, htmlAam }
} = support;

const mutateReference = reference => {
  if (!reference) return reference;

  if (reference.type === 'aria') {
    const fragmentId = aria.fragmentIds[reference.value];
    if (fragmentId) {
      reference.value = `${aria.baseUrl}${fragmentId}`;
      reference.linkText = `${reference.linkText} ${aria.linkText}`;
    }
  }

  if (reference.type === 'htmlAam') {
    const fragmentId = htmlAam.fragmentIds[reference.value];
    if (fragmentId) {
      reference.value = `${htmlAam.baseUrl}${fragmentId}`;
      reference.linkText = `${reference.linkText} ${htmlAam.linkText}`;
    }
  }

  return reference;
};

const getTests = parentRecord => {
  let testPlanVersion;
  let testPlanReport;
  if (parentRecord.tests) {
    testPlanVersion = parentRecord;
  } else if (parentRecord.testPlanRuns) {
    testPlanReport = parentRecord;
    testPlanVersion = parentRecord.testPlanVersion;
  } else if (parentRecord.testResults) {
    testPlanReport = parentRecord.testPlanReport;
    testPlanVersion = parentRecord.testPlanReport.testPlanVersion;
  }

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

            if (!commandKVs[0]) return { id: '', text: '' };
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
    assertions: test.assertions.map(assertion => {
      const renderableContentAssertion =
        isV2 &&
        test.renderableContent.assertions.find(
          a => a.assertionId === assertion.rawAssertionId
        );
      if (isV2 && !renderableContentAssertion)
        throw new Error(
          `unexpected.renderableContentAssertion.found: ${assertion.rawAssertionId}`
        );

      let references =
        isV2 && renderableContentAssertion.refIds.trim() !== ''
          ? renderableContentAssertion.refIds
              .trim()
              .split(' ')
              .map(refId => {
                const reference = test.renderableContent.info.references.find(
                  r => r.refId === refId
                );
                return mutateReference(reference);
              })
          : null;

      return {
        ...assertion,
        text: isV2 ? assertion.assertionStatement : assertion.text,
        phrase: isV2 ? assertion.assertionPhrase : null,
        references
      };
    })
  }));
};

module.exports = getTests;
