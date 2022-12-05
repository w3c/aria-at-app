const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const {
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');

const deleteTestResultsResolver = async (
    { parentContext: { id: testPlanRunId } },
    _,
    { user }
) => {
    const { testPlanRun } = await populateData({ testPlanRunId });

    if (
        !(
            user?.roles.find(role => role.name === 'ADMIN') ||
            (user?.roles.find(role => role.name === 'TESTER') &&
                testPlanRun.testerUserId == user.id)
        )
    ) {
        throw new AuthenticationError();
    }

    await updateTestPlanRun(testPlanRunId, { testResults: [] });

    // Perform in background
    await persistConflictsCount(testPlanRun);
    return populateData({ testPlanRunId });
};

const persistConflictsCount = async testPlanRun => {
    const { testPlanReport: updatedTestPlanReport } = await populateData({
        testPlanRunId: testPlanRun.id
    });
    const conflicts = await conflictsResolver(updatedTestPlanReport);
    await updateTestPlanReport(updatedTestPlanReport.id, {
        metrics: {
            ...updatedTestPlanReport.metrics,
            conflictsCount: conflicts.length
        }
    });
};

module.exports = deleteTestResultsResolver;
