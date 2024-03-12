const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanRunById
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');

const deleteTestResultResolver = async (
    { parentContext: { id: testResultId } },
    _,
    context
) => {
    const { user, transaction } = context;

    const { testPlanRun } = await populateData(
        { testResultId },
        { transaction }
    );

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

    await updateTestPlanRunById({
        id: testPlanRun.id,
        values: { testResults: newTestResults },
        transaction
    });

    return populateData({ testPlanRunId: testPlanRun.id }, { transaction });
};

module.exports = deleteTestResultResolver;
