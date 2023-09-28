const { AuthenticationError } = require('apollo-server');
const populateData = require('../../services/PopulatedData/populateData');
const {
    updateTestPlanVersion
} = require('../../models/services/TestPlanVersionService');

const updateRecommendedPhaseTargetDateResolver = async (
    { parentContext: { id: testPlanVersionId } },
    { recommendedPhaseTargetDate },
    context
) => {
    const { user } = context;
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    await updateTestPlanVersion(testPlanVersionId, {
        recommendedPhaseTargetDate
    });

    return populateData({ testPlanVersionId }, { context });
};

module.exports = updateRecommendedPhaseTargetDateResolver;
