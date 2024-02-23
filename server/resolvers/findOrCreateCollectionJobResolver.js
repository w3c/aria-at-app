const { AuthenticationError } = require('apollo-server-core');
const {
    getOrCreateCollectionJob
} = require('../models/services/CollectionJobService');

const findOrCreateCollectionJobResolver = async (
    _,
    { id, status, testPlanReportId },
    context
) => {
    const { user, t } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    return getOrCreateCollectionJob({
        where: { id },
        values: { status, testPlanReportId },
        t
    });
};

module.exports = findOrCreateCollectionJobResolver;
