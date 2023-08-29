const {
    getOrCreateCollectionJob
} = require('../models/services/CollectionJobService');

const findOrCreateCollectionJobResolver = async (
    _,
    { input: { id, status } }
) => {
    const collectionJob = await getOrCreateCollectionJob({ id, status });

    return collectionJob;
};

module.exports = findOrCreateCollectionJobResolver;
