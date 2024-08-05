/**
 * This should take any of the valid priority inputs and return the currently known string
 * representation of that value.
 *
 * @param {number|string} priority
 * @returns {null|string}
 */
const convertAssertionPriority = priority => {
  const validInputRegex = /^(0|1|2|3|EXCLUDE|MUST|SHOULD|MAY)$/;

  if (!validInputRegex.test(priority)) return null;

  if (priority === 0) return 'EXCLUDE';
  if (priority === 1) return 'MUST';
  if (priority === 2) return 'SHOULD';
  if (priority === 3) return 'MAY';
  return priority;
};

module.exports = convertAssertionPriority;
