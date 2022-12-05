const { AuthenticationError, UserInputError } = require('apollo-server');
const {
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');
const deepCustomMerge = require('../../util/deepCustomMerge');
const deepPickEqual = require('../../util/deepPickEqual');
const convertTestResultToInput = require('../TestPlanRunOperations/convertTestResultToInput');
const createTestResultSkeleton = require('../TestPlanRunOperations/createTestResultSkeleton');
const {
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');

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

    // The populateData function will populate associations of JSON-based
    // models, but not Sequelize-based models. This is why the
    // convertTestResultToInput function is needed to make testResultPopulated
    // equivalent to testPlanRun.testResults.
    const oldTestResults = testPlanRun.testResults;
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
            excludeKeys: ['unexpectedBehaviors']
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

    // Perform in background
    persistConflictsCount(testPlanRun);

    return populateData({ testResultId });
};

const persistConflictsCount = async testPlanRun => {
    const { testPlanReport: updatedTestPlanReport } = await populateData({
        testPlanRunId: testPlanRun.id
    });
    const conflicts = await conflictsResolver(updatedTestPlanReport);
    await updateTestPlanReport(updatedTestPlanReport.id, {
        metrics: {
            ...updatedTestPlanReport.metrics,
            conflictsCount: conflicts.length
        }
    });
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

    const checkUnexpectedBehavior = unexpectedBehavior => {
        if (
            (!!unexpectedBehavior.otherUnexpectedBehaviorText &&
                unexpectedBehavior.id !== 'OTHER') ||
            (!unexpectedBehavior.otherUnexpectedBehaviorText &&
                unexpectedBehavior.id === 'OTHER')
        ) {
            failed = true;
        }
    };

    const checkScenarioResult = scenarioResult => {
        if (!scenarioResult.output || !scenarioResult.unexpectedBehaviors) {
            failed = true;
        }
        scenarioResult.assertionResults.forEach(checkAssertionResult);
        scenarioResult.unexpectedBehaviors?.forEach(checkUnexpectedBehavior);
    };

    newTestResult.scenarioResults.forEach(checkScenarioResult);

    if (failed) {
        throw new Error('Invalid Test Result');
    }
};

module.exports = saveTestResultCommon;
