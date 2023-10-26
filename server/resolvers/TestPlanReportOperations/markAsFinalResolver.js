const { AuthenticationError } = require('apollo-server');
const {
    getTestPlanReportById,
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const populateData = require('../../services/PopulatedData/populateData');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');

const markAsFinalResolver = async (
    { parentContext: { id: testPlanReportId } },
    _,
    context
) => {
    const { user } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const testPlanReport = await getTestPlanReportById(testPlanReportId);

    const conflicts = await conflictsResolver(testPlanReport, null, context);
    if (conflicts.length > 0) {
        throw new Error(
            'Cannot mark test plan report as final due to conflicts'
        );
    }

    const runnableTests = runnableTestsResolver(testPlanReport);

    const hasIncompleteTestRuns = testPlanReport.testPlanRuns.find(
        testPlanRun => {
            return testPlanRun.testResults.length !== runnableTests.length;
        }
    );

    if (hasIncompleteTestRuns) {
        throw new Error(
            'Cannot mark test plan report as final because not all testers have completed their test runs.'
        );
    }

    await updateTestPlanReport(testPlanReportId, { markedFinalAt: new Date() });

    return populateData({ testPlanReportId }, { context });
};

module.exports = markAsFinalResolver;
