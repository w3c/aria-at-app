const { AuthenticationError } = require('apollo-server');
const { deleteAtBugById } = require('../models/services/AtBugService');

const deleteAtBugResolver = async (_, { id }, context) => {
  const { user, transaction } = context;

  if (
    !user?.roles.find(role => role.name === 'ADMIN' || role.name === 'VENDOR')
  ) {
    throw new AuthenticationError();
  }

  const result = await deleteAtBugById({
    id,
    transaction
  });

  return result > 0;
};

module.exports = deleteAtBugResolver;
