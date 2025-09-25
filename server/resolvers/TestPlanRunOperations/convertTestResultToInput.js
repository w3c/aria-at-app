const { omit } = require('lodash');

const convertTestResultToInput = testResult => {
  return {
    ...omit(testResult, ['test', 'atVersion', 'browserVersion']),
    scenarioResults: testResult.scenarioResults.map(
      convertScenarioResultToInput
    )
  };
};

const convertScenarioResultToInput = scenarioResult => {
  return {
    ...omit(scenarioResult, ['scenario']),
    assertionResults: scenarioResult.assertionResults.map(
      convertAssertionResultToInput
    ),
    negativeSideEffects: scenarioResult.negativeSideEffects?.map(
      convertNegativeSideEffectToInput
    )
  };
};

const convertAssertionResultToInput = assertionResult => {
  return { ...omit(assertionResult, ['assertion']) };
};

const convertNegativeSideEffectToInput = negativeSideEffect => {
  return { ...omit(negativeSideEffect, ['text']) };
};

module.exports = convertTestResultToInput;
