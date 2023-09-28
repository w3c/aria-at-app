const { AuthenticationError } = require('apollo-server');

const {
    updateCollectionJob,
    getCollectionJobById
} = require('../../models/services/CollectionJobService');

const { COLLECTION_JOB_STATUS } = require('../../util/enums');

const markCollectionJobFinishedResolver = async (
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

    if (collectionJob.status === COLLECTION_JOB_STATUS.COMPLETED) {
        return collectionJob;
    } else {
        return updateCollectionJob(collectionJobId, {
            status: COLLECTION_JOB_STATUS.CANCELLED
        });
    }
};

module.exports = markCollectionJobFinishedResolver;
