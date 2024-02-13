const {
    getTestPlanRuns
} = require('../models/services.deprecated/TestPlanRunService');

const testPlanRunsResolver = async (_, { testPlanReportId }) => {
    const where = {};
    if (testPlanReportId) where.testPlanReportId = testPlanReportId;
    return getTestPlanRuns(null, where);
};

module.exports = testPlanRunsResolver;
