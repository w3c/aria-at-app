const {
    getTestPlanReportById,
} = require('../../models/services/TestPlanReportService');

const resultingTestPlanReportResolver = ({ parentContext: { id } }) => {
    return getTestPlanReportById(id);
};

module.exports = resultingTestPlanReportResolver;
