const {
    getTestPlanReportById
} = require('../models/services/TestPlanReportService');

const testPlanReportResolver = (_, { id }, context) => {
    const { transaction } = context;

    return getTestPlanReportById({ id, transaction });
};

module.exports = testPlanReportResolver;
