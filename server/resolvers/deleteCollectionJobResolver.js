const { AuthenticationError } = require('apollo-server-core');
const {
    deleteCollectionJob
} = require('../models/services.deprecated/CollectionJobService');

const deleteCollectionJobResolver = async (_, { id }, context) => {
    const { user } = context;
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }
    return deleteCollectionJob(id);
};

module.exports = deleteCollectionJobResolver;
