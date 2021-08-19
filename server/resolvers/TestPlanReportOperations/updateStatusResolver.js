const { AuthenticationError } = require('apollo-server');
const {
    getTestPlanReportById,
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
// const isCompleteResolver = require('../TestPlanRun/isCompleteResolver');
const populatedDataResolver = require('../PopulatedData');

const updateStatusResolver = async (
    { parentContext: { id: testPlanReportId } },
    { status: status },
    { user }
) => {
    let roles = [...user.roles];
    if (user.roles.length && typeof user.roles[0] === 'object')
        roles = user.roles.map(role => role.name);

    if (!roles.includes('ADMIN')) {
        throw new AuthenticationError('Unauthorized');
    }

    const testPlanReport = await getTestPlanReportById(testPlanReportId);

    const conflicts = conflictsResolver(testPlanReport);
    const conflictsCount = Object.keys(conflicts).reduce(
        (acc, curr) => (conflicts[curr].length ? 1 : 0),
        0
    );
    if (conflictsCount > 0) {
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

    return populatedDataResolver({
        parentContext: { locationOfData: { testPlanReportId } }
    });
};

module.exports = updateStatusResolver;
