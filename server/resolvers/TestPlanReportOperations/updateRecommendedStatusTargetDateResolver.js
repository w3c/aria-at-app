const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const populateData = require('../../services/PopulatedData/populateData');

const updateRecommendedStatusTargetDateResolver = async (
    { parentContext: { id: testPlanReportId } },
    { recommendedStatusTargetDate },
    context
) => {
    const { user } = context;
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    await updateTestPlanReport(testPlanReportId, {
        recommendedStatusTargetDate
    });

    return populateData({ testPlanReportId }, { context });
};

module.exports = updateRecommendedStatusTargetDateResolver;
