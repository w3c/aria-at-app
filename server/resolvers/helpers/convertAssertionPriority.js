/**
 * This should take any of the valid priority inputs and return the currently known string
 * representation of that value.
 * TODO: Eventually, this should only need to take 'number' types as priority once 'REQUIRED' and
 *       'OPTIONAL' are no longer used
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
