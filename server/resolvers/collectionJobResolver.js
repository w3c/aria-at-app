const { AuthenticationError } = require('apollo-server-errors');
const {
    getCollectionJobById
} = require('../models/services/CollectionJobService');

const collectionJobResolver = async (_, { id }, { user }) => {
    // if (
    //     !(
    //         user?.roles.find(role => role.name === 'ADMIN') ||
    //         user?.roles.find(role => role.name === 'VENDOR')
    //     )
    // ) {
    //     throw new AuthenticationError();
    // }

    const collectionJob = await getCollectionJobById(id);

    return collectionJob;
};

module.exports = collectionJobResolver;
