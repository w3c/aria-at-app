const { AuthenticationError } = require('apollo-server');
const {
  linkAtBugsToAssertion
} = require('../models/services/AssertionService');

const linkAtBugsToAssertionResolver = async (
  _,
  { assertionId, atBugIds },
  context
) => {
  const { user, transaction } = context;

  if (
    !user?.roles.find(role => role.name === 'ADMIN' || role.name === 'VENDOR')
  ) {
    throw new AuthenticationError();
  }

  return await linkAtBugsToAssertion({
    assertionId,
    atBugIds,
    transaction
  });
};

module.exports = linkAtBugsToAssertionResolver;
