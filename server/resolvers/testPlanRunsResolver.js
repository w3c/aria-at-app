const { getTestPlanRuns } = require('../models/services/TestPlanRunService');

const testPlanRunsResolver = async (_, { testPlanReportId }, context) => {
    const { t } = context;

    const where = {};
    if (testPlanReportId) where.testPlanReportId = testPlanReportId;
    return getTestPlanRuns({ where, t });
};

module.exports = testPlanRunsResolver;
