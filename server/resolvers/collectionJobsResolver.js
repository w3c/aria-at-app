const { AuthenticationError } = require('apollo-server-express');
const {
  getCollectionJobs
} = require('../models/services/CollectionJobService');

const collectionJobsResolver = async (_, __, context) => {
  const { user, transaction } = context;

  if (!user) {
    throw new AuthenticationError();
  }

  const collectionJobs = await getCollectionJobs({ transaction });

  return collectionJobs;
};

module.exports = collectionJobsResolver;
