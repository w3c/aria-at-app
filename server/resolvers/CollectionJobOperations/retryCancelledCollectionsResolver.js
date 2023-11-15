const { AuthenticationError } = require('apollo-server');

const {
    getCollectionJobById,
    retryCancelledCollections
} = require('../../models/services/CollectionJobService');

const { COLLECTION_JOB_STATUS } = require('../../util/enums');

const retryCancelledCollectionsResolver = async (
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

    return retryCancelledCollections({ collectionJob });
};

module.exports = retryCancelledCollectionsResolver;
