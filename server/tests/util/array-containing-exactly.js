// Custom matcher that is a modified version of ArrayContaining
// but requires at every element in the array is present
// https://github.com/facebook/jest/blob/master/packages/expect/src/asymmetricMatchers.ts#L117

const { equals } = require('expect/build/jasmineUtils');

class ArrayContainingExactly {
  constructor(sample) {
    this.sample = sample;
  }

  asymmetricMatch(other) {
    if (!Array.isArray(this.sample)) {
      throw new Error(
        `You must provide an array to ${this.toString()}, not '` +
          typeof this.sample +
          "'."
      );
    }

    const result =
      this.sample.length === other.length &&
      Array.isArray(other) &&
      this.sample.every(item => other.some(another => equals(item, another)));

    return result;
  }

  toString() {
    return `Array Containing`;
  }

  getExpectedType() {
    return 'array';
  }
}

module.exports = ArrayContainingExactly;
