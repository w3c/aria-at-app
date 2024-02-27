const { AuthenticationError } = require('apollo-server-core');
const {
    restartCollectionJob
} = require('../models/services.deprecated/CollectionJobService');

const restartCollectionJobResolver = async (_, { id }, context) => {
    const { user, transaction } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    return restartCollectionJob({ id }, { transaction });
};

module.exports = restartCollectionJobResolver;
