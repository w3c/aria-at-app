const {
    deleteCollectionJob
} = require('../models/services/CollectionJobService');

const deleteCollectionJobResolver = async (_, { id }) =>
    await deleteCollectionJob(id);

module.exports = deleteCollectionJobResolver;
