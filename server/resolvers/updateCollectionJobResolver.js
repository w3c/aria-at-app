const { AuthenticationError } = require('apollo-server-core');
const {
    updateCollectionJob
} = require('../models/services/CollectionJobService');

const updateCollectionJobResolver = async (_, { id, status }, context) => {
    const { user } = context;
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const collectionJobs = await updateCollectionJob(id, { status });

    return collectionJobs;
};

module.exports = updateCollectionJobResolver;
