const {
    getTestPlanReports
} = require('../../models/services/TestPlanReportService');

const testPlanReportsResolver = async ({ id: testPlanVersionId }) => {
    const where = {
        testPlanVersionId
    };

    return getTestPlanReports(null, where, null, null, null, null, null, null, {
        order: [['createdAt', 'desc']]
    });
};

module.exports = testPlanReportsResolver;
