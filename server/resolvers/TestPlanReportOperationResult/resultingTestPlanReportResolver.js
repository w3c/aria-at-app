const {
    getTestPlanReportById,
} = require('../../models/services/TestPlanReportService');

const resultingTestPlanReportResolver = async ({ parentContext: { id } }) => {
    const result = await getTestPlanReportById(id);
    return result;
};

module.exports = resultingTestPlanReportResolver;
