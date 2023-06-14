const {
    getTestPlanReports
} = require('../../models/services/TestPlanReportService');

const testPlanReportsResolver = async (
    { id: testPlanVersionId, phase },
    { isCurrentPhase }
) => {
    const where = {
        testPlanVersionId
    };
    if (isCurrentPhase) where.status = phase;

    return getTestPlanReports(null, where, null, null, null, null, null, null, {
        order: [['createdAt', 'desc']]
    });
};

module.exports = testPlanReportsResolver;
