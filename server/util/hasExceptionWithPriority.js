/**
 * Determine whether a given assertion belongs to a given scenario and includes
 * at least one exception with a given priority.
 *
 * @param {Assertion} assertion Assertion to check
 * @param {Scenario} scenario Scenario to check
 * @param {string} priority Priority to check
 * @returns {boolean} Whether the assertion has an exception with the given priority
 */
const hasExceptionWithPriority = (assertion, scenario, priority) => {
  return assertion.assertionExceptions?.some(exception => {
    const scenarioCommandId = scenario.commands.map(({ id }) => id).join(' ');
    const scenarioAtOperatingMode = scenario.commands[0].atOperatingMode;

    return (
      scenarioCommandId === exception.commandId &&
      scenarioAtOperatingMode === exception.settings &&
      exception.priority === priority
    );
  });
};

module.exports = {
  hasExceptionWithPriority
};
