const { AuthenticationError } = require('apollo-server');
const { updateAtVersionById } = require('../../models/services/AtService');

const updateAtVersionResolver = async (
  { parentContext: { id } },
  { input },
  context
) => {
  const { user, transaction } = context;

  if (!user?.roles.find(role => role.name === 'ADMIN')) {
    throw new AuthenticationError();
  }

  return await updateAtVersionById({ id, values: input, transaction });
};

module.exports = updateAtVersionResolver;
