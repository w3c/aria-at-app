const { AuthenticationError } = require('apollo-server');
const {
    getTestPlanReportById,
    updateTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const {
    updateTestPlanRunById
} = require('../../models/services/TestPlanRunService');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const populateData = require('../../services/PopulatedData/populateData');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');

const markAsFinalResolver = async (
    { parentContext: { id: testPlanReportId } },
    { primaryTestPlanRunId },
    context
) => {
    const { user, transaction } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const testPlanReport = await getTestPlanReportById({
        id: testPlanReportId,
        transaction
    });

    const conflicts = await conflictsResolver(testPlanReport, null, context);
    if (conflicts.length > 0) {
        throw new Error(
            'Cannot mark test plan report as final due to conflicts'
        );
    }

    const runnableTests = runnableTestsResolver(testPlanReport, null, context);

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

    // Clear any other isPrimary status for attached testPlanRuns
    for (const testPlanRun of testPlanReport.testPlanRuns) {
        const { id } = testPlanRun;

        await updateTestPlanRunById({
            id,
            values: { isPrimary: false },
            transaction
        });
    }

    if (primaryTestPlanRunId) {
        const primaryTestPlanRunIdExists = testPlanReport.testPlanRuns.find(
            ({ id }) => id === Number(primaryTestPlanRunId)
        );

        if (primaryTestPlanRunIdExists) {
            await updateTestPlanRunById({
                id: primaryTestPlanRunId,
                values: { isPrimary: true },
                transaction
            });
        }
    }

    await updateTestPlanReportById({
        id: testPlanReportId,
        values: { markedFinalAt: new Date() },
        transaction
    });

    return populateData({ testPlanReportId }, { context });
};

module.exports = markAsFinalResolver;
