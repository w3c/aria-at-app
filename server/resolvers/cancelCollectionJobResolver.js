const { AuthenticationError } = require('apollo-server-core');
const {
    cancelCollectionJob
} = require('../models/services/CollectionJobService');

const cancelCollectionJobResolver = async (_, { id }, context) => {
    const { user } = context;
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    return cancelCollectionJob({ id });
};

module.exports = cancelCollectionJobResolver;
