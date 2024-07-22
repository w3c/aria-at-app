/**
 * Returns a shallow copy of an object where the key / value entries have been
 * alphabetized based on a provided function.
 *
 * Note that ES2015+ versions of JS do guarantee property order:
 * https://stackoverflow.com/questions/5525795/does-javascript-guarantee-object-property-order
 *
 * @param {*} object - an object to sort.
 * @param {*} getString - function that takes the [key, value] and returns a
 * string to be used for alphabetic comparisons.
 * @returns - The same object but with its keys sorted.
 */
const alphabetizeObjectBy = (object, getString) => {
  return Object.fromEntries(
    Object.entries(object).sort((a, b) => {
      // https://stackoverflow.com/a/45544166/3888572
      return getString(a).localeCompare(getString(b));
    })
  );
};

export default alphabetizeObjectBy;
