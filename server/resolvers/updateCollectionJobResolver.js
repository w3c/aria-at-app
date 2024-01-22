const { AuthenticationError } = require('apollo-server-core');
const {
    updateCollectionJob
} = require('../models/services/CollectionJobService');

const updateCollectionJobResolver = async (
    _,
    { id, status, externalLogsUrl },
    context
) => {
    const { user } = context;
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const updateParams = {
        ...(status && { status }),
        ...(externalLogsUrl && { externalLogsUrl })
    };

    const collectionJobs = await updateCollectionJob(id, updateParams);

    return collectionJobs;
};

module.exports = updateCollectionJobResolver;
