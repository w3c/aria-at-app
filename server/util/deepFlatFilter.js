const { isPlainObject } = require('lodash');

/**
 * Allows you to iterate over a nested object and/or arrays, returning an array of desired values.
 * @param {*} nested - An array, or object with properties, that contains arrays or more objects with properties.
 * @param {function} testCallback - A test function which will be called for every iterated value, and, when true is returned from the function, that value will included in the resulting array.
 * @returns {array} - An array of values which matched.
 */
const deepFlatFilter = (nested, testCallback) => {
  const foundValues = [];
  const recurse = nestedPart => {
    const isMatch = testCallback(nestedPart);
    if (isMatch) foundValues.push(nestedPart);

    if (isPlainObject(nestedPart)) {
      Object.values(nestedPart).forEach(recurse);
    } else if (Array.isArray(nestedPart)) {
      nestedPart.forEach(recurse);
    }
  };
  recurse(nested);
  return foundValues;
};

module.exports = deepFlatFilter;
