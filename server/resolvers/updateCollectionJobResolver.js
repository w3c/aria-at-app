const {
    updateCollectionJob
} = require('../models/services/CollectionJobService');

const updateCollectionJobResolver = async (_, { id, status }) => {
    const collectionJobs = await updateCollectionJob(id, { status });

    return collectionJobs;
};

module.exports = updateCollectionJobResolver;
