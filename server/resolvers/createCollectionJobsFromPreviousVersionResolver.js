const { AuthenticationError } = require('apollo-server-core');
const {
  createCollectionJobsFromPreviousVersion
} = require('../models/services/CollectionJobService');

const createCollectionJobsFromPreviousVersionResolver = async (
  _,
  { atVersionId },
  context
) => {
  const { user, transaction } = context;

  if (!user?.roles.find(role => role.name === 'ADMIN')) {
    throw new AuthenticationError();
  }

  try {
    const collectionJobs = await createCollectionJobsFromPreviousVersion({
      atVersionId,
      transaction
    });

    return {
      collectionJobs,
      message: `Successfully created ${collectionJobs.length} collection jobs from previous version`
    };
  } catch (error) {
    throw new Error(
      `Failed to create collection jobs from previous version: ${error.message}`
    );
  }
};

module.exports = createCollectionJobsFromPreviousVersionResolver;
