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
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    await updateTestPlanRun(testPlanRunId, { testResults: [] });

    return populateData({ testPlanRunId });
};

module.exports = deleteTestResultsResolver;
