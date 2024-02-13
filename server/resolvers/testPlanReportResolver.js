const {
    getTestPlanReportById
} = require('../models/services.deprecated/TestPlanReportService');

const testPlanReportResolver = (_, { id }) => {
    return getTestPlanReportById(id);
};

module.exports = testPlanReportResolver;
