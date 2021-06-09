const {
    getTestPlanReports
} = require('../models/services/TestPlanReportService');

const testPlanReportsResolver = (_, { statuses }) => {
    const where = {};
    if (statuses) where.status = statuses;

    return getTestPlanReports(null, where);
};

module.exports = testPlanReportsResolver;
