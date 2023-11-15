const convertAssertionPriority = require('../helpers/convertAssertionPriority');

const assertionResultsResolver = (scenarioResult, { priority }) => {
    if (!priority) return scenarioResult.assertionResults;

    return scenarioResult.assertionResults.filter(
        assertionResult =>
            convertAssertionPriority(assertionResult.assertion.priority) ===
            convertAssertionPriority(priority)
    );
};

module.exports = assertionResultsResolver;
