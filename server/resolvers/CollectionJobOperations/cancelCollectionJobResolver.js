const { AuthenticationError } = require('apollo-server');

const {
    updateCollectionJobById,
    getCollectionJobById
} = require('../../models/services/CollectionJobService');

const { COLLECTION_JOB_STATUS } = require('../../util/enums');

const cancelCollectionJobResolver = async (
    { parentContext: { id: collectionJobId } },
    _,
    context
) => {
    const { user, t } = context;

    if (
        !user?.roles.find(
            role => role.name === 'ADMIN' || role.name === 'TESTER'
        )
    ) {
        throw new AuthenticationError();
    }

    const collectionJob = await getCollectionJobById({
        id: collectionJobId,
        t
    });

    if (!collectionJob) {
        throw new Error(
            `Could not find collection job with id ${collectionJobId}`
        );
    }

    if (collectionJob.status === COLLECTION_JOB_STATUS.COMPLETED) {
        return collectionJob;
    } else {
        return updateCollectionJobById({
            id: collectionJobId,
            values: { status: COLLECTION_JOB_STATUS.CANCELLED },
            t
        });
    }
};

module.exports = cancelCollectionJobResolver;
