const {
    getTestPlanReportById
} = require('../models/services/TestPlanReportService');

const testPlanReportResolver = (_, { id }, context) => {
    const { t } = context;

    return getTestPlanReportById({ id, t });
};

module.exports = testPlanReportResolver;
