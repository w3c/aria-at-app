const { AuthenticationError } = require('apollo-server-core');
const {
    updateCollectionJob
} = require('../../models/services/CollectionJobService');

const updateCollectionJobResolver = async (
    { parentContext: { id: collectionJobId } },
    { status, externalLogsUrl },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const updateParams = {
        ...(status && { status }),
        ...(externalLogsUrl && { externalLogsUrl })
    };

    const collectionJob = await updateCollectionJob(
        collectionJobId,
        updateParams
    );

    return collectionJob;
};

module.exports = updateCollectionJobResolver;
