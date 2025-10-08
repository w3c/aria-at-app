const {
  getAssertionsByAtBugId
} = require('../../models/services/AssertionService');

const assertionsResolver = async ({ id }, _, context) => {
  const { transaction } = context;
  return await getAssertionsByAtBugId({
    atBugId: id,
    transaction
  });
};

module.exports = assertionsResolver;

