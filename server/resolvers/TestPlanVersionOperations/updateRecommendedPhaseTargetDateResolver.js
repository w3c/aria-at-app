const { AuthenticationError } = require('apollo-server');
const populateData = require('../../services/PopulatedData/populateData');
const {
    updateTestPlanVersionById
} = require('../../models/services/TestPlanVersionService');

const updateRecommendedPhaseTargetDateResolver = async (
    { parentContext: { id: testPlanVersionId } },
    { recommendedPhaseTargetDate },
    context
) => {
    const { user, transaction } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    await updateTestPlanVersionById({
        id: testPlanVersionId,
        values: { recommendedPhaseTargetDate },
        transaction
    });

    return populateData({ testPlanVersionId }, { context });
};

module.exports = updateRecommendedPhaseTargetDateResolver;
