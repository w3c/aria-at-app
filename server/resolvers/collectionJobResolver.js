const {
    getCollectionJobById
} = require('../models/services/CollectionJobService');

const collectionJobResolver = async (_, { id }, context) => {
    const { t } = context;

    const collectionJob = await getCollectionJobById({ id, t });

    return collectionJob;
};

module.exports = collectionJobResolver;
