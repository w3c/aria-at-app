const { AuthenticationError } = require('apollo-server');
const {
  unlinkAtBugsFromAssertion
} = require('../models/services/AssertionService');

const unlinkAtBugsFromAssertionResolver = async (
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

  return await unlinkAtBugsFromAssertion({
    assertionId,
    atBugIds,
    transaction
  });
};

module.exports = unlinkAtBugsFromAssertionResolver;
