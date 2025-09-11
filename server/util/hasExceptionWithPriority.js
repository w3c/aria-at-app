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
  return assertion.assertionExceptions?.some(
    exception =>
      scenario.commands.find(
        command =>
          command.id === exception.commandId &&
          command.atOperatingMode === exception.settings
      ) && exception.priority === priority
  );
};

module.exports = {
  hasExceptionWithPriority
};
