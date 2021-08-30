const { AuthenticationError } = require('apollo-server');
const {
    getTestPlanReportById,
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const { populateData } = require('../../services/PopulatedData');

const updateStatusResolver = async (
    { parentContext: { id: testPlanReportId } },
    { status: status },
    { user }
) => {
    const roles = user ? user.roles.map(role => role.name) : [];
    if (!roles.includes('ADMIN')) {
        throw new AuthenticationError('Unauthorized');
    }

    const testPlanReport = await getTestPlanReportById(testPlanReportId);

    const conflicts = await conflictsResolver(testPlanReport);
    if (conflicts.length > 0) {
        throw new Error('Cannot finalize test plan report due to conflicts');
    }

    /*
    TODO: The previous implementation did allow for runs to be finalized with 'skipped' test results. May want to review throwing this exception?
    const isIncomplete = testPlanReport.testPlanRuns.find(
        testPlanRun => !isCompleteResolver(testPlanRun)
    );

    if (isIncomplete) {
        throw new Error(
            'Cannot finalize test plan due to incomplete test runs'
        );
    }*/

    await updateTestPlanReport(testPlanReportId, { status });

    return populateData({ testPlanReportId });
};

module.exports = updateStatusResolver;
