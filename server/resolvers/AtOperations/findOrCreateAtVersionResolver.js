const { AuthenticationError } = require('apollo-server');
const { findOrCreateAtVersion } = require('../../models/services/AtService');

const findOrCreateAtVersionResolver = async (
  { parentContext: { id: atId } },
  { input: { name, releasedAt } },
  context
) => {
  const { user, transaction } = context;

  if (!user?.roles.find(role => role.name === 'ADMIN')) {
    throw new AuthenticationError();
  }

  return findOrCreateAtVersion({
    where: { atId, name, releasedAt },
    transaction
  });
};

module.exports = findOrCreateAtVersionResolver;
