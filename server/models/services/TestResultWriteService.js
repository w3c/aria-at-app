const populateData = require('../../services/PopulatedData/populateData');
const runnableTestsResolver = require('../../resolvers/TestPlanReport/runnableTestsResolver');
const getMetrics = require('../../util/getMetrics');
const { updateTestPlanReportById } = require('./TestPlanReportService');
const createTestResultSkeleton = require('../../resolvers/TestPlanRunOperations/createTestResultSkeleton');
const sortArrayLikeArray = require('../../util/sortArrayLikeArray');
const { updateTestPlanRunById } = require('./TestPlanRunService');
const { getFinalizedTestResults } = require('./TestResultReadService');

const findOrCreateTestResult = async ({
    testId,
    testPlanRunId,
    atVersionId,
    browserVersionId,
    transaction
}) => {
    const { testPlanRun, testPlanReport } = await populateData({
        testPlanRunId
    });

    const fixTestPlanReportMetrics = async testPlanReportStale => {
        const { testPlanReport } = await populateData({
            testPlanReportId: testPlanReportStale.id
        });
        const runnableTests = runnableTestsResolver(testPlanReport);
        const finalizedTestResults = await getFinalizedTestResults({
            ...testPlanReport
        });
        const metrics = getMetrics({
            testPlanReport: {
                ...testPlanReport,
                finalizedTestResults,
                runnableTests
            }
        });
        await updateTestPlanReportById({
            id: testPlanReport.id,
            values: { metrics: { ...testPlanReport.metrics, ...metrics } },
            transaction
        });
    };

    const { test, testPlanVersion } = await populateData({ testId });

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

        await updateTestPlanRunById({
            id: testPlanRun.id,
            values: { testResults: newTestResults },
            transaction
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

        await updateTestPlanRunById({
            id: testPlanRun.id,
            values: { testResults: newTestResults },
            transaction
        });
        await fixTestPlanReportMetrics(testPlanReport);
    }

    return populateData({ testResultId: newTestResult.id });
};

module.exports = {
    findOrCreateTestResult
};
