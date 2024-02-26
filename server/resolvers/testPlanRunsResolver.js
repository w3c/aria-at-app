const { getTestPlanRuns } = require('../models/services/TestPlanRunService');

const testPlanRunsResolver = async (_, { testPlanReportId }, context) => {
    const { transaction } = context;

    const where = {};
    if (testPlanReportId) where.testPlanReportId = testPlanReportId;
    return getTestPlanRuns({ where, transaction });
};

module.exports = testPlanRunsResolver;
