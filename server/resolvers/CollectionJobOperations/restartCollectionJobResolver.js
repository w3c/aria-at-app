const { AuthenticationError } = require('apollo-server-core');
const {
    restartCollectionJob
} = require('../../models/services/CollectionJobService');

const restartCollectionJobResolver = async (
    { parentContext: { id: collectionJobId } },
    _,
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    return restartCollectionJob({ id: collectionJobId });
};

module.exports = restartCollectionJobResolver;
