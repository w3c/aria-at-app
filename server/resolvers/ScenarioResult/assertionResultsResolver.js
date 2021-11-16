const assertionResultsResolver = (scenarioResult, { priority }) => {
    if (!priority) return scenarioResult.assertionResults;

    return scenarioResult.assertionResults.filter(
        assertionResult => assertionResult.assertion.priority === priority
    );
};

module.exports = assertionResultsResolver;
