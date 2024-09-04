const { getUserById } = require('../models/services/UserService');

const meResolver = async (_, __, { user, transaction }) => {
  // TODO: set back to the context user
  return getUserById({ id: user.id, transaction });
};

module.exports = meResolver;
