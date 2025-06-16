/**
 * Generate a text-based summary of the assertion verdicts in a given "metrics"
 * object.
 *
 * @param {object} metrics
 *
 * @returns {string}
 */
export default metrics => {
  const {
    assertionsPassedCount,
    assertionsUntestableCount,
    mustAssertionsFailedCount,
    shouldAssertionsFailedCount,
    mayAssertionsFailedCount
  } = metrics;

  const mustShouldAssertionsFailedCount =
    mustAssertionsFailedCount + shouldAssertionsFailedCount;

  return (
    `${assertionsPassedCount} passed, ` +
    `${mustShouldAssertionsFailedCount} failed, ` +
    `${mayAssertionsFailedCount} unsupported` +
    (assertionsUntestableCount
      ? `, ${assertionsUntestableCount} untestable`
      : '')
  );
};
