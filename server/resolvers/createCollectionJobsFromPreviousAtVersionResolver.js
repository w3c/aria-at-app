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

  try {
    const collectionJobs = await createCollectionJobsFromPreviousAtVersion({
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

module.exports = createCollectionJobsFromPreviousAtVersionResolver;
