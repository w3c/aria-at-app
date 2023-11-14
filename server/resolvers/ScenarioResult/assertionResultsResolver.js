const convertAssertionPriority = priority => {
    if (priority === 'REQUIRED') return 'MUST';
    if (priority === 'OPTIONAL') return 'SHOULD';
    return priority;
};

const assertionResultsResolver = (scenarioResult, { priority }) => {
    if (!priority) return scenarioResult.assertionResults;

    return scenarioResult.assertionResults.filter(
        assertionResult =>
            convertAssertionPriority(assertionResult.assertion.priority) ===
            convertAssertionPriority(priority)
    );
};

module.exports = assertionResultsResolver;
