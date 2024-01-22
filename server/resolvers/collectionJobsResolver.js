const {
    getCollectionJobs
} = require('../models/services/CollectionJobService');

const collectionJobsResolver = async () => {
    const collectionJobs = await getCollectionJobs();

    return collectionJobs;
};

module.exports = collectionJobsResolver;
