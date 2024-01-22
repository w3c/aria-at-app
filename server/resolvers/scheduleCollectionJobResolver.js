const { AuthenticationError } = require('apollo-server-core');
const {
    scheduleCollectionJob
} = require('../models/services/CollectionJobService');

const scheduleCollectionJobResolver = async (
    _,
    { testPlanReportId },
    context
) => {
    const { user } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    return scheduleCollectionJob({ testPlanReportId });
};

module.exports = scheduleCollectionJobResolver;
