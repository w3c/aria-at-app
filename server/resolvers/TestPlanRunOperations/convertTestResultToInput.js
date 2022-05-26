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
        unexpectedBehaviors: scenarioResult.unexpectedBehaviors?.map(
            convertUnexpectedBehaviorToInput
        )
    };
};

const convertAssertionResultToInput = assertionResult => {
    return { ...omit(assertionResult, ['assertion']) };
};

const convertUnexpectedBehaviorToInput = unexpectedBehavior => {
    return { ...omit(unexpectedBehavior, ['text']) };
};

module.exports = convertTestResultToInput;
