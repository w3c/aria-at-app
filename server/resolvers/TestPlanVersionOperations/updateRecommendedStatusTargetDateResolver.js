const { AuthenticationError } = require('apollo-server');
const populateData = require('../../services/PopulatedData/populateData');
const {
    updateTestPlanVersion
} = require('../../models/services/TestPlanVersionService');

const updateRecommendedStatusTargetDateResolver = async (
    { parentContext: { id: testPlanVersionId } },
    { recommendedStatusTargetDate },
    context
) => {
    const { user } = context;
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    await updateTestPlanVersion(testPlanVersionId, {
        recommendedStatusTargetDate
    });

    return populateData({ testPlanVersionId }, { context });
};

module.exports = updateRecommendedStatusTargetDateResolver;
