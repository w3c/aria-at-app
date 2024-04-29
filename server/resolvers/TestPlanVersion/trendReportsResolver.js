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
    // eg. query {
    //   testPlanVersion(id: 56291) {
    //     id
    //     title
    //     phase
    //     recommendedPhaseReachedAt
    //     trendReports(atId: 3, browserId: 3) {
    //       id
    //       recommendedAtVersion {
    //         id
    //         name
    //       }
    //       metrics
    //     }
    //   }
    // }
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
