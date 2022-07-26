const { AuthenticationError, UserInputError } = require('apollo-server');
const {
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');
const deepCustomMerge = require('../../util/deepCustomMerge');
const deepPickEqual = require('../../util/deepPickEqual');
const convertTestResultToInput = require('../TestPlanRunOperations/convertTestResultToInput');
const createTestResultSkeleton = require('../TestPlanRunOperations/createTestResultSkeleton');

const saveTestResultCommon = async ({
    testResultId,
    input,
    user,
    isSubmit
}) => {
    const {
        testPlanRun,
        testPlanReport,
        test,
        testResult: testResultPopulated
    } = await populateData({ testResultId });

    if (
        !(
            user?.roles.find(role => role.name === 'ADMIN') ||
            (user?.roles.find(role => role.name === 'TESTER') &&
                testPlanRun.testerUserId == user.id)
        )
    ) {
        throw new AuthenticationError();
    }

    const oldTestResults = testPlanRun.testResults;
    // testResultPopulated is a TestResult type and has populated scenario,
    // test, assertion etc. fields. It should just be a TestResultInput type for
    // saving in the database. See graphql-schema.js for more info.
    const oldTestResult = convertTestResultToInput(testResultPopulated);

    const newTestResult = deepCustomMerge(oldTestResult, input, {
        identifyArrayItem: item => item.id,
        removeArrayItems: true
    });

    const isCorrupted = !deepPickEqual(
        [
            createTestResultSkeleton({ test, testPlanRun, testPlanReport }),
            newTestResult
        ],
        {
            pickKeys: ['id', 'testId', 'scenarioId', 'assertionId'],
            excludeKeys: ['unexpectedBehaviors', 'unexpectedBehaviorNote']
        }
    );
    if (isCorrupted) {
        throw new UserInputError(
            'Data was received in an unexpected shape, it must match the ' +
                'format provided by the findOrCreateTestResult mutation.'
        );
    }

    if (isSubmit) {
        assertTestResultIsValid(newTestResult);
        newTestResult.completedAt = new Date();
    } else {
        newTestResult.completedAt = null;
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
                (assertionResult.passed === true &&
                    !assertionResult.failedReason) ||
                (assertionResult.passed === false &&
                    !!assertionResult.failedReason)
            )
        ) {
            failed = true;
        }
    };

    const checkUnexpectedBehavior = (
        unexpectedBehavior,
        unexpectedBehaviorNote
    ) => {
        if (!unexpectedBehaviorNote && unexpectedBehavior.id === 'OTHER') {
            failed = true;
        }
    };

    const checkScenarioResult = scenarioResult => {
        if (
            !scenarioResult.output ||
            !scenarioResult.unexpectedBehaviors ||
            (scenarioResult.unexpectedBehaviorNote &&
                !scenarioResult.unexpectedBehaviors.length)
        ) {
            failed = true;
        }
        scenarioResult.assertionResults.forEach(checkAssertionResult);
        scenarioResult.unexpectedBehaviors?.forEach(unexpectedBehavior => {
            checkUnexpectedBehavior(
                unexpectedBehavior,
                scenarioResult.unexpectedBehaviorNote
            );
        });
    };

    newTestResult.scenarioResults.forEach(checkScenarioResult);

    if (failed) {
        throw new Error('Invalid Test Result');
    }
};

module.exports = saveTestResultCommon;
