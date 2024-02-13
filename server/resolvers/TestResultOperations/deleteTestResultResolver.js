const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanRun
} = require('../../models/services.deprecated/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');

const deleteTestResultResolver = async (
    { parentContext: { id: testResultId } },
    _,
    context
) => {
    const { user } = context;
    const { testPlanRun } = await populateData({ testResultId });

    if (
        !(
            user?.roles.find(role => role.name === 'ADMIN') ||
            (user?.roles.find(role => role.name === 'TESTER') &&
                testPlanRun.testerUserId == user.id)
        )
    ) {
        throw new AuthenticationError();
    }

    const index = testPlanRun.testResults.findIndex(
        each => each.id === testResultId
    );
    const newTestResults = [
        ...testPlanRun.testResults.slice(0, index),
        ...testPlanRun.testResults.slice(index + 1)
    ];

    await updateTestPlanRun(testPlanRun.id, { testResults: newTestResults });

    return populateData({ testPlanRunId: testPlanRun.id });
};

module.exports = deleteTestResultResolver;
