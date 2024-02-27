const convertAssertionPriority = require('../../util/convertAssertionPriority');

const assertionResultsResolver = (
    scenarioResult,
    { priority },
    context // eslint-disable-line no-unused-vars
) => {
    if (!priority) return scenarioResult.assertionResults;

    return scenarioResult.assertionResults.filter(assertionResult => {
        if (assertionResult.assertion?.assertionExceptions?.length) {
            const scenarioSettings = scenarioResult.scenario.settings;
            const scenarioCommandId = scenarioResult.scenario.commandIds[0];

            const foundException =
                assertionResult.assertion.assertionExceptions.find(
                    exception =>
                        exception.settings === scenarioSettings &&
                        exception.commandId === scenarioCommandId
                );

            if (foundException) {
                return (
                    convertAssertionPriority(foundException.priority) ===
                    convertAssertionPriority(priority)
                );
            }
        }

        return (
            convertAssertionPriority(assertionResult.assertion.priority) ===
            convertAssertionPriority(priority)
        );
    });
};

module.exports = assertionResultsResolver;
