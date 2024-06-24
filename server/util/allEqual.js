const { isEqual } = require('lodash');

const allEqual = items => {
  for (let i = 0; i < items.length - 1; i += 1) {
    if (!isEqual(items[i], items[i + 1])) return false;
  }
  return true;
};

module.exports = allEqual;
