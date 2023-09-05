const { AuthenticationError, UserInputError } = require('apollo-server');
const {
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');
const sortArrayLikeArray = require('../../util/sortArrayLikeArray');
const createTestResultSkeleton = require('./createTestResultSkeleton');
const getMetrics = require('../../util/getMetrics');
const {
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');

const findOrCreateTestResultResolver = async (
    { parentContext: { id: testPlanRunId } },
    { testId, atVersionId, browserVersionId },
    context
) => {
    const { user } = context;

    const fixTestPlanReportMetrics = async testPlanReportStale => {
        const { testPlanReport } = await populateData({
            testPlanReportId: testPlanReportStale.id
        });
        const runnableTests = runnableTestsResolver(testPlanReport);
        const finalizedTestResults = await finalizedTestResultsResolver(
            {
                ...testPlanReport
            },
            null,
            context
        );
        const metrics = getMetrics({
            testPlanReport: {
                ...testPlanReport,
                finalizedTestResults,
                runnableTests
            }
        });
        await updateTestPlanReport(testPlanReport.id, {
            metrics: { ...testPlanReport.metrics, ...metrics }
        });
    };

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
        await fixTestPlanReportMetrics(testPlanReport);
    } else {
        // atVersionId and browserVersionId update
        const testResultIndex = testPlanRun.testResults.findIndex(
            testResult => testResult.id === newTestResult.id
        );
        const newTestResults = [...testPlanRun.testResults];

        newTestResults[testResultIndex].atVersionId = atVersionId;
        newTestResults[testResultIndex].browserVersionId = browserVersionId;

        await updateTestPlanRun(testPlanRun.id, {
            testResults: newTestResults
        });
        await fixTestPlanReportMetrics(testPlanReport);
    }

    return populateData({ testResultId: newTestResult.id });
};

module.exports = findOrCreateTestResultResolver;
