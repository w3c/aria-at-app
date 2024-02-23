const {
    getTestPlanReports
} = require('../../models/services/TestPlanReportService');

const testPlanReportsResolver = async (
    { id: testPlanVersionId },
    { isFinal },
    context
) => {
    const { t } = context;

    const reports = await getTestPlanReports({
        where: { testPlanVersionId },
        pagination: { order: [['createdAt', 'desc']] },
        t
    });

    if (isFinal === undefined) return reports;
    else if (isFinal) return reports.filter(report => !!report.markedFinalAt);
    else if (!isFinal) return reports.filter(report => !report.markedFinalAt);
};

module.exports = testPlanReportsResolver;
