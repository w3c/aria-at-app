const { AuthenticationError } = require('apollo-server-core');
const {
  createCollectionJobsFromPreviousAtVersion
} = require('../models/services/CollectionJobService');

const createCollectionJobsFromPreviousAtVersionResolver = async (
  _,
  { atVersionId },
  context
) => {
  const { user, transaction } = context;

  if (!user?.roles.find(role => role.name === 'ADMIN')) {
    throw new AuthenticationError();
  }

  return createCollectionJobsFromPreviousAtVersion({
    atVersionId,
    transaction
  });
};

module.exports = createCollectionJobsFromPreviousAtVersionResolver;
