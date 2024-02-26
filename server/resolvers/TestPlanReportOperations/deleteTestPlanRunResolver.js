const { AuthenticationError } = require('apollo-server');
const {
    removeTestPlanRunByQuery
} = require('../../models/services.deprecated/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const {
    updateTestPlanReport
} = require('../../models/services.deprecated/TestPlanReportService');

const deleteTestPlanRunResolver = async (
    { parentContext: { id: testPlanReportId } },
    { userId: testerUserId },
    context
) => {
    const { user } = context;
    if (
        !(
            user?.roles.find(role => role.name === 'ADMIN') ||
            (user?.roles.find(role => role.name === 'TESTER') &&
                testerUserId == user.id)
        )
    ) {
        throw new AuthenticationError();
    }

    await removeTestPlanRunByQuery({
        testPlanReportId,
        testerUserId
    });

    const { testPlanReport } = await populateData({
        testPlanReportId
    });
    const conflicts = await conflictsResolver(testPlanReport);
    await updateTestPlanReport(testPlanReport.id, {
        metrics: {
            ...testPlanReport.metrics,
            conflictsCount: conflicts.length
        }
    });

    return populateData({ testPlanReportId });
};

module.exports = deleteTestPlanRunResolver;
