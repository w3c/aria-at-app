const { AuthenticationError } = require('apollo-server-core');
const {
    getOrCreateCollectionJob
} = require('../models/services.deprecated/CollectionJobService');

const findOrCreateCollectionJobResolver = async (
    _,
    { id, status, testPlanReportId },
    context
) => {
    const { user } = context;
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const collectionJob = await getOrCreateCollectionJob({
        id,
        status,
        testPlanReportId
    });

    return collectionJob;
};

module.exports = findOrCreateCollectionJobResolver;
