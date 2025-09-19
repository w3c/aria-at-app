const { hasExceptionWithPriority } = require('./hasExceptionWithPriority');

/**
 * Compute the total possible assertions for a given set of runnable tests and an AT ID.
 *
 * @param {Test[]} runnableTests Tests to compute total possible assertions for
 * @param {string} atId AT ID to compute total possible assertions for
 * @returns {number} Total possible assertions
 */
const computeTotalPossibleAssertions = (runnableTests, atId) => {
  if (!runnableTests || !runnableTests.length) return 0;

  let totalAssertionsPossible = 0;
  runnableTests.forEach(test => {
    if (!test.scenarios || !test.assertions) return;

    const scenariosForAt = test.scenarios.filter(
      scenario => scenario.at.id === atId
    );

    scenariosForAt.forEach(scenario => {
      const filteredAssertions = test.assertions.filter(
        assertion => !hasExceptionWithPriority(assertion, scenario, 'EXCLUDE')
      );
      totalAssertionsPossible += filteredAssertions.length;
    });
  });

  return totalAssertionsPossible;
};

module.exports = {
  computeTotalPossibleAssertions
};
