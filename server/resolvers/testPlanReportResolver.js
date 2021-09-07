const {
    getTestPlanReportById
} = require('../models/services/TestPlanReportService');

const testPlanReportResolver = (_, { id }) => {
    return getTestPlanReportById(id);
};

module.exports = testPlanReportResolver;
