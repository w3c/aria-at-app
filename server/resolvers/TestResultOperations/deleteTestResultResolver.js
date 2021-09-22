const { UserInputError, AuthenticationError } = require('apollo-server');
const {
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');

const deleteTestResultResolver = async (
    { parentContext: { id: testResultId } },
    _,
    { user }
) => {
    let testPlanRun;
    try {
        ({ testPlanRun } = await populateData({ testResultId }));
    } catch {
        throw new UserInputError('Failed to load data for the given ID');
    }

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
