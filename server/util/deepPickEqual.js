const { isPlainObject } = require('lodash');
const allEqual = require('./allEqual');

/**
 * Compare two deeply nested objects / arrays to determine if they are
 * equivalent, only comparing a specific list of keys.
 * @param {array[*]} comparisons - array of items to compare
 * @param {*} options
 * @param {string[]} options.pickKeys - the names of the object keys which
 * should be compared.
 * @param {string[]} options.excludeKeys - any keys which should be ignored.
 * They will be excluded from futher recursion.
 * @returns {boolean} - Whether the objects are equivalent
 */
const deepPickEqual = (
    comparisons,
    { pickKeys = null, excludeKeys = [] } = {}
) => {
    let failed = false;

    const recurse = (parts, parentKey = null) => {
        if (isPlainObject(parts[0])) {
            Object.keys(parts[0]).forEach(key => {
                if (!excludeKeys.includes(key)) {
                    recurse(
                        parts.map(part => part?.[key]),
                        key
                    );
                }
            });
        } else if (Array.isArray(parts[0])) {
            parts[0].forEach((_, index) => {
                recurse(parts.map(part => part?.[index]));
            });
        } else if (!pickKeys || pickKeys.includes(parentKey)) {
            if (!allEqual(parts)) failed = true;
        }
    };

    recurse(comparisons);

    return !failed;
};

module.exports = deepPickEqual;
