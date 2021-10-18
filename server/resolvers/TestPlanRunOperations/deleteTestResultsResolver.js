const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');

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

    return populateData({ testPlanRunId });
};

module.exports = deleteTestResultsResolver;
