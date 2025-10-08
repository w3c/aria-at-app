const { AuthenticationError } = require('apollo-server');
const {
  unlinkAtBugsFromAssertion,
  getAssertionByEncodedId
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

  try {
    return await unlinkAtBugsFromAssertion({
      assertionId: numericAssertionId,
      atBugIds,
      transaction
    });
  } catch (e) {
    console.error('unlinkAtBugsFromAssertion error', {
      assertionId,
      atBugIds,
      message: e.message,
      code: e?.original?.code || e?.parent?.code || e.code
    });
    throw e;
  }
};

module.exports = unlinkAtBugsFromAssertionResolver;
