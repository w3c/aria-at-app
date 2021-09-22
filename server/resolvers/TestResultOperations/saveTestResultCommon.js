const { AuthenticationError, UserInputError } = require('apollo-server');
const {
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');
const deepCustomMerge = require('../../util/deepCustomMerge');
const deepPickEqual = require('../../util/deepPickEqual');
const unexpectedBehaviors = require('../../resources/unexpectedBehaviors.json');
const createTestResultSkeleton = require('../TestPlanRunOperations/createTestResultSkeleton');

const saveTestResultCommon = async ({
    testResultId,
    input,
    user,
    isSubmit
}) => {
    if (
        !(
            user?.roles.find(role => role.name === 'ADMIN') ||
            (user?.roles.find(role => role.name === 'TESTER') &&
                testPlanRun.testerUserId == user.id)
        )
    ) {
        throw new AuthenticationError();
    }

    let testPlanRun, testPlanTarget, test, oldTestResult;
    try {
        ({
            testPlanRun,
            testPlanTarget,
            test,
            testResult: oldTestResult
        } = await populateData({ testResultId }));
    } catch {
        throw new UserInputError('Failed to load data for the given ID');
    }

    const oldTestResults = testPlanRun.testResults;

    const newTestResult = deepCustomMerge(oldTestResult, input, {
        identifyArrayItem: item => item.id,
        removeArrayItems: true
    });

    const isCorrupted = !deepPickEqual(
        [
            createTestResultSkeleton({ test, testPlanRun, testPlanTarget }),
            newTestResult
        ],
        {
            pickKeys: ['id', 'testId', 'scenarioId', 'assertionId'],
            excludeKeys: ['unexpectedBehaviors']
        }
    );
    if (isCorrupted) {
        throw new UserInputError(
            'Data was received in an unexpected shape, it must match the ' +
                'format provided by the createTestResult mutation.'
        );
    }

    if (isSubmit) {
        assertTestResultIsValid(newTestResult);
        newTestResult.completedAt = new Date();
    }

    const index = oldTestResults.findIndex(each => each.id === testResultId);
    const newTestResults = [
        ...oldTestResults.slice(0, index),
        newTestResult,
        ...oldTestResults.slice(index + 1)
    ];

    await updateTestPlanRun(testPlanRun.id, { testResults: newTestResults });

    return populateData({ testResultId });
};

const assertTestResultIsValid = newTestResult => {
    let failed = false;
    const checkAssertionResult = assertionResult => {
        if (
            !(
                assertionResult.passed === true ||
                (assertionResult.passed === false &&
                    !!assertionResult.failedReason)
            )
        ) {
            failed = true;
        }
    };

    const checkUnexpectedBehavior = unexpectedBehavior => {
        const unexpectedBehaviorIds = Object.keys(unexpectedBehaviors);
        if (
            !unexpectedBehaviorIds.includes(unexpectedBehavior.id) ||
            (!!unexpectedBehavior.otherUnexpectedBehaviorText &&
                unexpectedBehavior.id === 'other')
        ) {
            failed = true;
        }
    };

    const checkScenarioResult = scenarioResult => {
        if (!scenarioResult.output) failed = true;
        scenarioResult.assertionResults.forEach(checkAssertionResult);
        scenarioResult.unexpectedBehaviors.forEach(checkUnexpectedBehavior);
    };

    newTestResult.scenarioResults.forEach(checkScenarioResult);

    if (failed) {
        throw new Error('Invalid Test Result');
    }
};

module.exports = saveTestResultCommon;
