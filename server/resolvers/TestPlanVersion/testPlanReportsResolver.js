const {
    getTestPlanReports
} = require('../../models/services/TestPlanReportService');

const testPlanReportsResolver = async (
    { id: testPlanVersionId },
    { isFinal }
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

    if (isFinal === undefined) return reports;
    else if (isFinal) return reports.filter(report => !!report.markedFinalAt);
    else if (!isFinal) return reports.filter(report => !report.markedFinalAt);
};

module.exports = testPlanReportsResolver;
