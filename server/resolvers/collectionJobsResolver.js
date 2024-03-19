const {
  getCollectionJobs
} = require('../models/services/CollectionJobService');

const collectionJobsResolver = async (_, __, context) => {
  const { transaction } = context;

  const collectionJobs = await getCollectionJobs({ transaction });

  return collectionJobs;
};

module.exports = collectionJobsResolver;
