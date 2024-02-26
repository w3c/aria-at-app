const { AuthenticationError } = require('apollo-server');
const {
    removeTestPlanRunByQuery
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const {
    updateTestPlanReportById
} = require('../../models/services/TestPlanReportService');

const deleteTestPlanRunResolver = async (
    { parentContext: { id: testPlanReportId } },
    { userId: testerUserId },
    context
) => {
    const { user, transaction } = context;
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
        where: { testPlanReportId, testerUserId },
        transaction
    });

    const { testPlanReport } = await populateData({
        testPlanReportId
    });
    const conflicts = await conflictsResolver(testPlanReport);
    await updateTestPlanReportById({
        id: testPlanReport.id,
        where: {
            metrics: {
                ...testPlanReport.metrics,
                conflictsCount: conflicts.length
            }
        }
    });

    return populateData({ testPlanReportId });
};

module.exports = deleteTestPlanRunResolver;
