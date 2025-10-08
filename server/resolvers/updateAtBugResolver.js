const { AuthenticationError } = require('apollo-server');
const { updateAtBugById } = require('../models/services/AtBugService');

const updateAtBugResolver = async (_, { id, input }, context) => {
  const { user, transaction } = context;

  if (
    !user?.roles.find(role => role.name === 'ADMIN' || role.name === 'VENDOR')
  ) {
    throw new AuthenticationError();
  }

  await updateAtBugById({
    id,
    values: input,
    transaction
  });

  // Return the updated bug with proper includes
  const { getAtBugById } = require('../models/services/AtBugService');
  return await getAtBugById({
    id,
    transaction
  });
};

module.exports = updateAtBugResolver;

