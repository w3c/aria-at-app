const { AuthenticationError } = require('apollo-server-core');
const {
    restartCollectionJob
} = require('../models/services/CollectionJobService');

const restartCollectionJobResolver = async (_, { id }, context) => {
    const { user } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    return restartCollectionJob({ id });
};

module.exports = restartCollectionJobResolver;
