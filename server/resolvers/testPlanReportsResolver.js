const {
    getTestPlanReports
} = require('../models/services/TestPlanReportService');

const testPlanReportsResolver = async (_, { statuses }) => {
    const where = {};
    if (statuses) where.status = statuses;

    return getTestPlanReports(
        undefined,
        where,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        { order: [['createdAt', 'desc']] }
    );
};

module.exports = testPlanReportsResolver;
