const { AuthenticationError } = require('apollo-server');

const {
    getCollectionJobById,
    retryCanceledCollections
} = require('../../models/services.deprecated/CollectionJobService');

const { COLLECTION_JOB_STATUS } = require('../../util/enums');

const retryCanceledCollectionsResolver = async (
    { parentContext: { id: collectionJobId } },
    _,
    { user }
) => {
    if (
        !user?.roles.find(
            role => role.name === 'ADMIN' || role.name === 'TESTER'
        )
    ) {
        throw new AuthenticationError();
    }

    const collectionJob = await getCollectionJobById(collectionJobId);

    if (!collectionJob) {
        throw new Error(
            `Could not find collection job with id ${collectionJobId}`
        );
    }

    if (collectionJob.status !== COLLECTION_JOB_STATUS.CANCELLED) {
        throw new Error(
            `Collection job with id ${collectionJobId} is ${collectionJob.status} not CANCELLED`
        );
    }

    return retryCanceledCollections({ collectionJob });
};

module.exports = retryCanceledCollectionsResolver;
