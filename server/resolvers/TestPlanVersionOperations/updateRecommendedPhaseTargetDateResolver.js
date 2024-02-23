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
    const { user, t } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    await updateTestPlanVersionById({
        id: testPlanVersionId,
        values: { recommendedPhaseTargetDate },
        t
    });

    return populateData({ testPlanVersionId });
};

module.exports = updateRecommendedPhaseTargetDateResolver;
