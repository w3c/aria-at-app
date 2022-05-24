const { AuthenticationError, UserInputError } = require('apollo-server');
const {
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');
const sortArrayLikeArray = require('../../util/sortArrayLikeArray');
const createTestResultSkeleton = require('./createTestResultSkeleton');

const findOrCreateTestResultResolver = async (
    { parentContext: { id: testPlanRunId } },
    { testId, atVersionId, browserVersionId },
    { user }
) => {
    const {
        testPlanRun,
        testPlanReport,
        testPlanVersion: testPlanRunTestPlanVersion
    } = await populateData({
        testPlanRunId
    });
    const { test, testPlanVersion } = await populateData({ testId });

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

    const newTestResult = createTestResultSkeleton({
        test,
        testPlanRun,
        testPlanReport,
        atVersionId,
        browserVersionId
    });

    const alreadyExists = !!testPlanRun.testResults.find(
        testResult => testResult.id === newTestResult.id
    );
    if (!alreadyExists) {
        const unorderedResults = [...testPlanRun.testResults, newTestResult];

        // Test Results should be in the same order as the tests
        const newTestResults = sortArrayLikeArray(
            unorderedResults,
            testPlanVersion.tests,
            {
                identifyArrayItem: testOrTestResult =>
                    testOrTestResult.testId ?? testOrTestResult.id
            }
        );

        await updateTestPlanRun(testPlanRun.id, {
            testResults: newTestResults
        });
    }

    return populateData({ testResultId: newTestResult.id });
};

module.exports = findOrCreateTestResultResolver;
