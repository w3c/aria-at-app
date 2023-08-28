const { AuthenticationError } = require('apollo-server-errors');
const {
    createCollectionJob
} = require('../models/services/CollectionJobService');

const addCollectionJobResolver = async (
    _,
    { input: { id, status } },
    { user }
) => {
    // if (
    //     !(
    //         user?.roles.find(role => role.name === 'ADMIN') ||
    //         user?.roles.find(role => role.name === 'VENDOR')
    //     )
    // ) {
    //     throw new AuthenticationError();
    // }

    const collectionJob = await createCollectionJob(id, status);

    return collectionJob;
};

module.exports = addCollectionJobResolver;
