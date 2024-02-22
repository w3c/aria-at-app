const { AuthenticationError } = require('apollo-server-core');
const {
    deleteCollectionJob
} = require('../../models/services/CollectionJobService');

const deleteCollectionJobResolver = async (
    { parentContext: { id: collectionJobId } },
    _,
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }
    return deleteCollectionJob(collectionJobId);
};

module.exports = deleteCollectionJobResolver;
