const { AuthenticationError } = require('apollo-server-core');
const {
  updateCollectionJobById
} = require('../models/services/CollectionJobService');

const updateCollectionJobResolver = async (
  _,
  { id, status, externalLogsUrl },
  context
) => {
  const { user, transaction } = context;

  if (!user?.roles.find(role => role.name === 'ADMIN')) {
    throw new AuthenticationError();
  }

  const values = {
    ...(status && { status }),
    ...(externalLogsUrl && { externalLogsUrl })
  };

  const collectionJobs = await updateCollectionJobById({
    id,
    values,
    transaction
  });

  return collectionJobs;
};

module.exports = updateCollectionJobResolver;
