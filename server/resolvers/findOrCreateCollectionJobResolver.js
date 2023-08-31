const {
    getOrCreateCollectionJob
} = require('../models/services/CollectionJobService');

const findOrCreateCollectionJobResolver = async (
    _,
    { id, status, testPlanReportId }
) => {
    const collectionJob = await getOrCreateCollectionJob({
        id,
        status,
        testPlanReportId
    });

    return collectionJob;
};

module.exports = findOrCreateCollectionJobResolver;
