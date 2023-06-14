const { AuthenticationError } = require('apollo-server');
const populateData = require('../../services/PopulatedData/populateData');
const {
    updateTestPlanVersion
} = require('../../models/services/TestPlanVersionService');

<<<<<<<< HEAD:server/resolvers/TestPlanReportOperations/unmarkAsFinalResolver.js
const unmarkAsFinalResolver = async (
    { parentContext: { id: testPlanReportId } },
    _,
========
const updateRecommendedStatusTargetDateResolver = async (
    { parentContext: { id: testPlanVersionId } },
    { recommendedStatusTargetDate },
>>>>>>>> de0fe7b8 (Update query and resolvers for test plan version mutations):server/resolvers/TestPlanVersionOperations/updateRecommendedStatusTargetDateResolver.js
    context
) => {
    const { user } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

<<<<<<<< HEAD:server/resolvers/TestPlanReportOperations/unmarkAsFinalResolver.js
    await updateTestPlanReport(testPlanReportId, { markedFinalAt: null });
========
    await updateTestPlanVersion(testPlanVersionId, {
        recommendedStatusTargetDate
    });
>>>>>>>> de0fe7b8 (Update query and resolvers for test plan version mutations):server/resolvers/TestPlanVersionOperations/updateRecommendedStatusTargetDateResolver.js

    return populateData({ testPlanVersionId }, { context });
};

module.exports = unmarkAsFinalResolver;
