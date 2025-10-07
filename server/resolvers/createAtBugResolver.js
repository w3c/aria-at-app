const { AuthenticationError } = require('apollo-server');
const {
  createAtBug,
  getAtBugById
} = require('../models/services/AtBugService');

const createAtBugResolver = async (_, { input }, context) => {
  const { user, transaction } = context;

  if (
    !user?.roles.find(role => role.name === 'ADMIN' || role.name === 'VENDOR')
  ) {
    throw new AuthenticationError();
  }

  const created = await createAtBug({ values: input, transaction });
  // Re-fetch with associations so AtBug.at is present (non-nullable)
  return await getAtBugById({ id: created.id, transaction });
};

module.exports = createAtBugResolver;
