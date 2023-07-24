const {
    getTestPlanReports
} = require('../../models/services/TestPlanReportService');

const testPlanReportsResolver = async (
    { id: testPlanVersionId },
    { isApproved }
) => {
    const where = {
        testPlanVersionId
    };

    const reports = await getTestPlanReports(
        null,
        where,
        null,
        null,
        null,
        null,
        null,
        null,
        {
            order: [['createdAt', 'desc']]
        }
    );

    if (isApproved === undefined) return reports;
    else if (isApproved) return reports.filter(report => !!report.approvedAt);
    else if (!isApproved) return reports.filter(report => !report.approvedAt);
};

module.exports = testPlanReportsResolver;
