const {
    getCollectionJobById
} = require('../models/services.deprecated/CollectionJobService');

const collectionJobResolver = async (_, { id }) => {
    const collectionJob = await getCollectionJobById(id);

    return collectionJob;
};

module.exports = collectionJobResolver;
