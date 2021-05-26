const {
    getTestPlanReportById,
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const { findTestPlanReportConflicts } = require('../utilities');

const updateStatusResolver = async (
    { parentContext: { id: testPlanReportId } },
    { status: status }
) => {
    const testPlanReport = await getTestPlanReportById(testPlanReportId);
    // TODO: consider middleware
    const conflicts = findTestPlanReportConflicts(testPlanReport);
    if (conflicts.length > 0) {
        throw new Error('Cannot finalize test plan report due to conflicts');
    }

    // TODO: consider middleware
    // TODO: this logic is not correct
    if (testPlanReport.testPlanRuns.find(run => !run.testResults)) {
        throw new Error(
            'Cannot finalize test plan due to incomplete test runs'
        );
    }

    await updateTestPlanReport(testPlanReportId, { status });
    return { parentContext: { id: testPlanReportId } };
};

module.exports = updateStatusResolver;
