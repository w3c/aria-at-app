const {
    getTestPlanReportById
} = require('../models/services/TestPlanReportService');

const testPlanReportsResolver = (_, { id }) => {
    return getTestPlanReportById(id);
};

module.exports = testPlanReportsResolver;
