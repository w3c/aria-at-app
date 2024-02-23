const {
    getCollectionJobs
} = require('../models/services/CollectionJobService');

const collectionJobsResolver = async (_, __, context) => {
    const { t } = context;

    const collectionJobs = await getCollectionJobs({ t });

    return collectionJobs;
};

module.exports = collectionJobsResolver;
