const {
    getTestPlanReportById
} = require('../models/services/TestPlanReportService');

const resultingTestPlanReportResolver = (_, { id }) => {
    return getTestPlanReportById(id);
};

module.exports = resultingTestPlanReportResolver;
