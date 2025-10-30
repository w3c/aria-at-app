const convertAssertionPriority = require('./convertAssertionPriority');

// Same as `server/resolvers/ScenarioResult/assertionResultsResolver.js`
const checkAssertionResultExceptionMatch = (
  assertionResult,
  scenarioResult,
  priority
) => {
  if (assertionResult.assertion?.assertionExceptions?.length) {
    const scenarioSettings = scenarioResult.scenario.settings;
    const scenarioCommandId = scenarioResult.scenario.commandIds.join(' ');

    const foundException = assertionResult.assertion.assertionExceptions.find(
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
};

module.exports = checkAssertionResultExceptionMatch;
