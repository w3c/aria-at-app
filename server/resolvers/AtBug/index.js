const atResolver = require('./atResolver');
const assertionsResolver = require('./assertionsResolver');

const AtBug = {
  at: atResolver,
  assertions: assertionsResolver
};

module.exports = AtBug;
