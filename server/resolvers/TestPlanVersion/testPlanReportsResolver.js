const {
    getTestPlanReports
} = require('../../models/services.deprecated/TestPlanReportService');

const testPlanReportsResolver = async (
    { id: testPlanVersionId },
    { isFinal },
    context
) => {
    const { transaction } = context;

    const reports = await getTestPlanReports({
        where: { testPlanVersionId },
        pagination: { order: [['createdAt', 'desc']] },
        transaction
    });

    if (isFinal === undefined) return reports;
    else if (isFinal) return reports.filter(report => !!report.markedFinalAt);
    else if (!isFinal) return reports.filter(report => !report.markedFinalAt);
};

module.exports = testPlanReportsResolver;
