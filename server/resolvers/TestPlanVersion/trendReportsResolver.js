const {
    getTrendReportDataForTarget
} = require('../../models/services/TestPlanVersionService');
const {
    getTestPlanReports
} = require('../../models/services/TestPlanReportService');

const trendReportsResolver = async (
    testPlanVersion,
    { atId, browserId },
    context
) => {
    const { transaction } = context;

    if (testPlanVersion.phase !== 'RECOMMENDED') return null;

    const testPlanReports = await getTrendReportDataForTarget({
        testPlanVersionId: testPlanVersion.id,
        atId,
        browserId,
        transaction
    });

    return await getTestPlanReports({
        where: {
            id: testPlanReports.map(({ testPlanReportId }) => testPlanReportId)
        },
        transaction
    });
};

module.exports = trendReportsResolver;
