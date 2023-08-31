const {
    getOrCreateCollectionJob
} = require('../models/services/CollectionJobService');
const { getTestPlanRunById } = require('../models/services/TestPlanRunService');

const findOrCreateCollectionJobResolver = async (
    _,
    { input: { id, status, testPlanRunId } }
) => {
    let testPlanRun = null;

    if (testPlanRunId) {
        testPlanRun = await getTestPlanRunById(testPlanRunId);
    }

    const collectionJob = await getOrCreateCollectionJob({
        id,
        status,
        testPlanRun
    });

    return collectionJob;
};

module.exports = findOrCreateCollectionJobResolver;
