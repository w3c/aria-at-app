const { AuthenticationError, UserInputError } = require('apollo-server');
const {
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');
const deepCustomMerge = require('../../util/deepCustomMerge');
const deepPickEqual = require('../../util/deepPickEqual');
const convertTestResultToInput = require('../TestPlanRunOperations/convertTestResultToInput');
const createTestResultSkeleton = require('../TestPlanRunOperations/createTestResultSkeleton');
const persistConflictsCount = require('../helpers/persistConflictsCount');

const saveTestResultCommon = async ({
    testResultId,
    input,
    user,
    isSubmit,
    context
}) => {
    const {
        testPlanRun,
        testPlanReport,
        test,
        testResult: testResultPopulated
    } = await populateData({ testResultId }, { context });

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

    // Some clients might send an otherUnexpectedBehaviorText for unexpectedBehaviors
    // that are not "OTHER". As long as the otherUnexpectedBehaviorText is null or undefined,
    // the best course of action is probably to allow it, but not save it to the database.
    newTestResult.scenarioResults.forEach(scenarioResult => {
        scenarioResult.unexpectedBehaviors.forEach(unexpectedBehavior => {
            if (
                unexpectedBehavior.id !== 'OTHER' &&
                unexpectedBehavior.otherUnexpectedBehaviorText == null
            ) {
                delete unexpectedBehavior.otherUnexpectedBehaviorText;
            }
        });
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

    // TODO: Avoid blocking loads in test runs with a larger amount of tests
    //       and/or test results
    await persistConflictsCount(testPlanRun, context);
    return populateData({ testResultId }, { context });
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
