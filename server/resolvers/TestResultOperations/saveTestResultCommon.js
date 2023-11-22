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
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const getMetrics = require('../../util/getMetrics');
const {
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');

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

    // Some clients might send an otherUnexpectedBehaviorText for unexpectedBehaviors
    // that are not "OTHER". As long as the otherUnexpectedBehaviorText is null or undefined,
    // the best course of action is probably to allow it, but not save it to the database.
    newTestResult.scenarioResults?.forEach(scenarioResult => {
        scenarioResult.unexpectedBehaviors?.forEach(unexpectedBehavior => {
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

    if (isSubmit) {
        // Update metrics when result is saved
        const { testPlanReport: testPlanReportPopulated } = await populateData(
            { testPlanReportId: testPlanReport.id },
            { context }
        );
        const runnableTests = runnableTestsResolver(testPlanReportPopulated);
        const finalizedTestResults = await finalizedTestResultsResolver(
            testPlanReportPopulated,
            null,
            context
        );
        const metrics = getMetrics({
            testPlanReport: {
                ...testPlanReportPopulated,
                finalizedTestResults,
                runnableTests
            }
        });
        await updateTestPlanReport(testPlanReportPopulated.id, {
            metrics: { ...testPlanReportPopulated.metrics, ...metrics }
        });
    }

    await persistConflictsCount(testPlanRun, context);
    return populateData({ testResultId }, { context });
};

const assertTestResultIsValid = newTestResult => {
    let failed = false;

    const checkAssertionResult = assertionResult => {
        if (
            !assertionResult.passed
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
