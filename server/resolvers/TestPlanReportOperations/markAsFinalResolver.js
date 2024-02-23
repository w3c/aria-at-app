const { AuthenticationError } = require('apollo-server');
const {
    getTestPlanReportById,
    updateTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const populateData = require('../../services/PopulatedData/populateData');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');

const markAsFinalResolver = async (
    { parentContext: { id: testPlanReportId } },
    _,
    context
) => {
    const { user, t } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const testPlanReport = await getTestPlanReportById({
        id: testPlanReportId,
        t
    });

    const conflicts = await conflictsResolver(testPlanReport);
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

    await updateTestPlanReportById({
        id: testPlanReportId,
        values: { markedFinalAt: new Date() },
        t
    });

    return populateData({ testPlanReportId });
};

module.exports = markAsFinalResolver;
