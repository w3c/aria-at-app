const { AuthenticationError } = require('apollo-server');
const { createAtBug } = require('../models/services/AtBugService');

const createAtBugResolver = async (_, { input }, context) => {
  const { user, transaction } = context;

  if (
    !user?.roles.find(role => role.name === 'ADMIN' || role.name === 'VENDOR')
  ) {
    throw new AuthenticationError();
  }

  return await createAtBug({
    values: input,
    transaction
  });
};

module.exports = createAtBugResolver;
