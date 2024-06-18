const { AuthenticationError } = require('apollo-server');

const {
    updateCollectionJobById,
    getCollectionJobById,
    updateCollectionJobTestStatusByQuery
} = require('../../models/services/CollectionJobService');

const { COLLECTION_JOB_STATUS } = require('../../util/enums');

const cancelCollectionJobResolver = async (
    { parentContext: { id: collectionJobId } },
    _,
    context
) => {
    const { user, transaction } = context;

    if (
        !user?.roles.find(
            role => role.name === 'ADMIN' || role.name === 'TESTER'
        )
    ) {
        throw new AuthenticationError();
    }

    const collectionJob = await getCollectionJobById({
        id: collectionJobId,
        transaction
    });

    if (!collectionJob) {
        throw new Error(
            `Could not find collection job with id ${collectionJobId}`
        );
    }

    if (collectionJob.status === COLLECTION_JOB_STATUS.COMPLETED) {
        return collectionJob;
    } else {
        await updateCollectionJobTestStatusByQuery({
            where: { collectionJobId, status: COLLECTION_JOB_STATUS.QUEUED },
            values: { status: COLLECTION_JOB_STATUS.CANCELLED },
            transaction
        });
        await updateCollectionJobTestStatusByQuery({
            where: { collectionJobId, status: COLLECTION_JOB_STATUS.RUNNING },
            values: { status: COLLECTION_JOB_STATUS.CANCELLED },
            transaction
        });
        return updateCollectionJobById({
            id: collectionJobId,
            values: { status: COLLECTION_JOB_STATUS.CANCELLED },
            transaction
        });
    }
};

module.exports = cancelCollectionJobResolver;
