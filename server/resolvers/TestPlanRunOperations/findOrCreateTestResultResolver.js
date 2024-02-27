const { AuthenticationError, UserInputError } = require('apollo-server');
const populateData = require('../../services/PopulatedData/populateData');
const {
    findOrCreateTestResult
} = require('../../models/services.deprecated/TestResultWriteService');

const findOrCreateTestResultResolver = async (
    { parentContext: { id: testPlanRunId } },
    { testId, atVersionId, browserVersionId },
    context
) => {
    const { user, transaction } = context;

    const {
        testPlanRun,
        testPlanReport,
        testPlanVersion: testPlanRunTestPlanVersion
    } = await populateData({ testPlanRunId }, { transaction });

    const { test, testPlanVersion } = await populateData(
        { testId },
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

    if (
        !test.atIds.find(atId => atId === testPlanReport.at.id) ||
        testPlanRunTestPlanVersion.id !== testPlanVersion.id
    ) {
        throw new UserInputError(
            'The given test is not runnable as part of this TestPlanReport'
        );
    }

    return findOrCreateTestResult({
        testId,
        testPlanRunId,
        atVersionId,
        browserVersionId,
        transaction
    });
};

module.exports = findOrCreateTestResultResolver;
