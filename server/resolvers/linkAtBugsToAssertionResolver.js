const { AuthenticationError } = require('apollo-server');
const {
  linkAtBugsToAssertion,
  getAssertionByEncodedId
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

  try {
    // Convert GraphQL encoded assertionId to numeric DB id if needed
    let numericAssertionId = assertionId;
    if (typeof assertionId === 'string' && !/^\d+$/.test(assertionId)) {
      const found = await getAssertionByEncodedId({
        encodedId: assertionId,
        transaction
      });
      numericAssertionId = found?.id;
    }

    if (!numericAssertionId) {
      throw new Error('Invalid assertionId');
    }

    return await linkAtBugsToAssertion({
      assertionId: numericAssertionId,
      atBugIds,
      transaction
    });
  } catch (e) {
    console.error('linkAtBugsToAssertion error', {
      assertionId,
      atBugIds,
      message: e.message,
      code: e?.original?.code || e?.parent?.code || e.code
    });
    throw e;
  }
};

module.exports = linkAtBugsToAssertionResolver;
