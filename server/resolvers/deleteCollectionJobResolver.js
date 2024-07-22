const { AuthenticationError } = require('apollo-server-core');
const {
  removeCollectionJobById
} = require('../models/services/CollectionJobService');

const deleteCollectionJobResolver = async (_, { id }, context) => {
  const { user, transaction } = context;

  if (!user?.roles.find(role => role.name === 'ADMIN')) {
    throw new AuthenticationError();
  }
  return removeCollectionJobById({ id, transaction });
};

module.exports = deleteCollectionJobResolver;
