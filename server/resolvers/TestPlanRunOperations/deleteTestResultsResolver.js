const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanRun
} = require('../../models/services.deprecated/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');
const persistConflictsCount = require('../helpers/persistConflictsCount');

const deleteTestResultsResolver = async (
    { parentContext: { id: testPlanRunId } },
    _,
    context
) => {
    const { user } = context;
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

    // TODO: Avoid blocking loads in test runs with a larger amount of tests
    //       and/or test results
    await persistConflictsCount(testPlanRun, context);
    return populateData({ testPlanRunId });
};

module.exports = deleteTestResultsResolver;
