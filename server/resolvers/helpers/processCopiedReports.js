const {
    getTestPlanVersionById
} = require('../../models/services/TestPlanVersionService');
const {
    getTestPlanReports,
    getOrCreateTestPlanReport,
    updateTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const { hashTest } = require('../../util/aria');
const {
    createTestPlanRun,
    updateTestPlanRunById
} = require('../../models/services/TestPlanRunService');
const createTestResultSkeleton = require('../TestPlanRunOperations/createTestResultSkeleton');
const populateData = require('../../services/PopulatedData/populateData');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const { getMetrics } = require('shared');

/**
 * Returns lists of known scenario and command ids for a test plan version's test
 * @param testPlanVersionTest
 * @returns {[string[],string[]]}
 */
const getKnownScenariosAndCommandIdsForTest = testPlanVersionTest => {
    const knownAssertionIdsForTest = [];
    const knownScenarioIdsForTest = [];

    for (const testPlanVersionAssertion of testPlanVersionTest.assertions) {
        const { text, rawAssertionId } = testPlanVersionAssertion;
        // `rawAssertionId` in v2 test format, otherwise `text` in v1 test format
        knownAssertionIdsForTest.push(rawAssertionId || text);
    }

    for (const testPlanVersionScenario of testPlanVersionTest.scenarios) {
        const { commandIds, atId, settings } = testPlanVersionScenario;
        let scenarioId = commandIds.join('-');
        scenarioId = `${scenarioId}_${atId}`;

        // settings may not exist if v1 test format
        if (settings) scenarioId = `${scenarioId}_${settings}`;
        knownScenarioIdsForTest.push(scenarioId);
    }

    return [knownScenarioIdsForTest, knownAssertionIdsForTest];
};

/**
 * Determine which tests between an 'old' and 'new' TestPlanVersion is the same between both
 * @param oldTestPlanVersion
 * @param newTestPlanVersion
 * @returns {{}}
 */
const getKeptTestsByTestHash = (oldTestPlanVersion, newTestPlanVersion) => {
    const updateOptions = { forUpdateCompare: true };
    const keptTestsByTestHash = {};

    for (const newTestPlanVersionTest of newTestPlanVersion.tests) {
        const newTestPlanVersionTestHash = hashTest(
            {
                ...newTestPlanVersionTest,
                rowNumber: String(newTestPlanVersionTest.rowNumber)
            },
            updateOptions
        );

        // Move to the next loop if the test hash is already being tracked
        if (keptTestsByTestHash[newTestPlanVersionTestHash]) continue;

        for (const oldTestPlanVersionTest of oldTestPlanVersion.tests) {
            const oldTestPlanVersionTestHash = hashTest(
                {
                    ...oldTestPlanVersionTest,
                    rowNumber: String(oldTestPlanVersionTest.rowNumber)
                },
                updateOptions
            );

            // Move to the next loop if the hashes don't match
            if (newTestPlanVersionTestHash !== oldTestPlanVersionTestHash)
                continue;

            // For each command and/or assertion under the test, will use to check if there is a
            // matching command and/or assertion. If there is a match, preserve the previous result,
            // otherwise mark the test as not being complete
            const [knownScenarioIdsForOldTest, knownAssertionIdsForOldTest] =
                getKnownScenariosAndCommandIdsForTest(oldTestPlanVersionTest);
            const [knownScenarioIdsForNewTest, knownAssertionIdsForNewTest] =
                getKnownScenariosAndCommandIdsForTest(newTestPlanVersionTest);

            keptTestsByTestHash[newTestPlanVersionTestHash] = {
                newTestPlanVersionTestId: newTestPlanVersionTest.id,
                oldTestPlanVersionTestId: oldTestPlanVersionTest.id,
                knownScenarioIdsForOldTest,
                knownAssertionIdsForOldTest,
                knownScenarioIdsForNewTest,
                knownAssertionIdsForNewTest
            };
        }
    }

    return keptTestsByTestHash;
};

/**
 * Determine which old version's test result should be preserved and which new result it connects to
 * @param testResults
 * @param keptTestsByTestHash
 * @returns {{}}
 */
const getKeptTestResultsByTestId = (testResults, keptTestsByTestHash) => {
    const keptTestResultsByTestId = {};
    for (const testResult of testResults) {
        // Check if the testId referenced also matches the hash on any in the
        // keptTestsByTestHash
        Object.keys(keptTestsByTestHash).forEach(key => {
            const {
                newTestPlanVersionTestId,
                oldTestPlanVersionTestId,
                knownAssertionIdsForOldTest,
                knownScenarioIdsForOldTest,
                knownAssertionIdsForNewTest,
                knownScenarioIdsForNewTest
            } = keptTestsByTestHash[key];

            if (oldTestPlanVersionTestId === testResult.testId) {
                // Then this data should be preserved
                keptTestResultsByTestId[newTestPlanVersionTestId] = {
                    ...testResult,
                    knownAssertionIdsForOldTest,
                    knownScenarioIdsForOldTest,
                    knownAssertionIdsForNewTest,
                    knownScenarioIdsForNewTest
                };
            } else {
                // TODO: Return information on which tests cannot be preserved
            }
        });
    }

    return keptTestResultsByTestId;
};

/**
 * Updates metrics and markedFinalAt status for newly created TestPlanReports after copying process
 * @param oldTestPlanReport
 * @param newTestPlanReport
 * @param testPlanRun
 * @param testResults
 * @param context
 * @param transaction
 * @returns {Promise<void>}
 */
const updateMetricsAndMarkedFinalAtForTestPlanReport = async ({
    oldTestPlanReport,
    newTestPlanReport,
    testPlanRun,
    testResults,
    context,
    transaction
}) => {
    await updateTestPlanRunById({
        id: testPlanRun.id,
        values: { testResults },
        transaction
    });

    // Update metrics for TestPlanReport
    const { testPlanReport: populatedTestPlanReport } = await populateData(
        { testPlanReportId: newTestPlanReport.id },
        { context }
    );

    const runnableTests = runnableTestsResolver(
        populatedTestPlanReport,
        null,
        context
    );
    let updateParams = {};

    // Mark the report as final if previously was for TestPlanVersion being deprecated; may still be
    // nullified if finalized test results aren't equal to the amount known number of possible
    // runnable tests, because no tests should be skipped. Would mean it CANNOT be final.
    if (oldTestPlanReport.markedFinalAt)
        updateParams = { markedFinalAt: new Date() };

    // Calculate the metrics (happens if updating to DRAFT)
    const conflicts = await conflictsResolver(
        populatedTestPlanReport,
        null,
        context
    );

    if (conflicts.length > 0) {
        // Then no chance to have finalized reports, and means it hasn't been
        // marked as final yet
        updateParams = {
            ...updateParams,
            markedFinalAt: null,
            metrics: {
                ...populatedTestPlanReport.metrics,
                conflictsCount: conflicts.length
            }
        };
    } else {
        const finalizedTestResults = await finalizedTestResultsResolver(
            populatedTestPlanReport,
            null,
            context
        );

        if (!finalizedTestResults || !finalizedTestResults.length) {
            updateParams = {
                ...updateParams,
                markedFinalAt: null,
                metrics: {
                    ...populatedTestPlanReport.metrics
                }
            };
        } else {
            const metrics = getMetrics({
                testPlanReport: {
                    ...populatedTestPlanReport,
                    finalizedTestResults,
                    runnableTests
                }
            });

            updateParams = {
                ...updateParams,
                // means test results have now been 'skipped' during the update process so these
                // cannot be finalized and must be updated in the test queue
                markedFinalAt:
                    finalizedTestResults.length < runnableTests.length
                        ? null
                        : updateParams.markedFinalAt,
                metrics: {
                    ...populatedTestPlanReport.metrics,
                    ...metrics
                }
            };
        }
    }

    await updateTestPlanReportById({
        id: populatedTestPlanReport.id,
        values: updateParams,
        transaction
    });
};

const processCopiedReports = async ({
    oldTestPlanVersionId,
    newTestPlanVersionId,
    newTestPlanReports,
    context
}) => {
    const { transaction } = context;

    // The testPlanVersion being updated
    const newTestPlanVersion = await getTestPlanVersionById({
        id: newTestPlanVersionId,
        transaction
    });

    let oldTestPlanVersion;
    let oldTestPlanReports = [];
    let newTestPlanReportIds = [];
    let updatedTestPlanReports = null;

    // These checks are needed to support the test plan version reports being updated with earlier
    // versions' data
    if (oldTestPlanVersionId) {
        oldTestPlanVersion = await getTestPlanVersionById({
            id: oldTestPlanVersionId,
            transaction
        });

        oldTestPlanReports = await getTestPlanReports({
            where: { testPlanVersionId: oldTestPlanVersionId },
            testPlanReportAttributes: null,
            testPlanRunAttributes: null,
            testPlanVersionAttributes: null,
            testPlanAttributes: null,
            atAttributes: null,
            browserAttributes: null,
            userAttributes: null,
            pagination: { order: [['createdAt', 'desc']] },
            transaction
        });
    }

    // There is no older test plan reports to process
    if (!oldTestPlanReports.length) {
        return {
            oldTestPlanVersion,
            newTestPlanReportIds,
            updatedTestPlanReports
        };
    }

    // If there is an earlier version that for this phase and that version has some test plan runs
    // in the test queue, this will run the process for updating existing test plan versions for the
    // test plan version and preserving data for tests that have not changed.
    for (const oldTestPlanReport of oldTestPlanReports) {
        // Verify an existing combination for the TestPlanVersion being updated to, does not already
        // exist
        if (
            newTestPlanReports.some(
                ({ atId, browserId }) =>
                    atId === oldTestPlanReport.atId &&
                    browserId === oldTestPlanReport.browserId
            )
        ) {
            continue;
        }

        // Then the combination needs to be considered if the tests are not different
        // between versions
        const keptTestsByTestHash = getKeptTestsByTestHash(
            oldTestPlanVersion,
            newTestPlanVersion
        );

        for (const oldTestPlanRun of oldTestPlanReport.testPlanRuns) {
            // Track which old test results need to be preserved
            const keptTestResultsByTestId = getKeptTestResultsByTestId(
                oldTestPlanRun.testResults,
                keptTestsByTestHash
            );

            if (!Object.keys(keptTestResultsByTestId).length) continue;

            // Create (or get) the new test plan report the results will be copied to
            const [newTestPlanReport] = await getOrCreateTestPlanReport({
                where: {
                    testPlanVersionId: newTestPlanVersionId,
                    atId: oldTestPlanReport.atId,
                    browserId: oldTestPlanReport.browserId
                },
                transaction
            });
            newTestPlanReportIds.push(newTestPlanReport.id);

            // Create the new test plan run for a previous assigned tester so old results can be
            // copied to it
            const newTestPlanRun = await createTestPlanRun({
                values: {
                    testerUserId: oldTestPlanRun.testerUserId,
                    testPlanReportId: newTestPlanReport.id
                },
                transaction
            });
            const newTestResults = [];

            for (const testResultToSaveTestId of Object.keys(
                keptTestResultsByTestId
            )) {
                const oldTestResult =
                    keptTestResultsByTestId[testResultToSaveTestId];
                const {
                    knownAssertionIdsForOldTest,
                    knownScenarioIdsForOldTest,
                    knownAssertionIdsForNewTest,
                    knownScenarioIdsForNewTest
                } = oldTestResult;

                const { test } = await populateData(
                    { testId: testResultToSaveTestId },
                    { context }
                );

                // Re-run createTestResultSkeleton to avoid unexpected scenario index matching issues when saving
                // future results; override newly generated test results with old results if exists
                let newTestResult = createTestResultSkeleton({
                    test,
                    testPlanRun: newTestPlanRun,
                    testPlanReport: newTestPlanReport,
                    atVersionId: oldTestResult.atVersionId,
                    browserVersionId: oldTestResult.browserVersionId
                });
                newTestResult.completedAt = oldTestResult.completedAt;

                const scenarioResultsByScenarioIds = {};
                knownScenarioIdsForOldTest.forEach((id, index) => {
                    scenarioResultsByScenarioIds[id] =
                        oldTestResult.scenarioResults[index];
                });

                // Preserve output and unexpectedBehaviors for each scenario if matching old result
                for (let [
                    scenarioIndex,
                    eachScenarioResult
                ] of newTestResult.scenarioResults.entries()) {
                    const rawScenarioId =
                        knownScenarioIdsForNewTest[scenarioIndex];

                    // Unknown combination of command + settings when compared with last version
                    const oldScenarioResult =
                        scenarioResultsByScenarioIds[rawScenarioId];
                    if (!oldScenarioResult) {
                        newTestResult.completedAt = null;
                        continue;
                    }

                    eachScenarioResult.output = oldScenarioResult.output;
                    eachScenarioResult.unexpectedBehaviors =
                        oldScenarioResult.unexpectedBehaviors;

                    const assertionResultsByAssertionIds = {};
                    knownAssertionIdsForOldTest.forEach((id, index) => {
                        assertionResultsByAssertionIds[id] =
                            oldScenarioResult.assertionResults[index];
                    });

                    // Preserve passed status for each assertion if matching old result
                    for (let [
                        assertionIndex,
                        eachAssertionResult
                    ] of eachScenarioResult.assertionResults.entries()) {
                        const rawAssertionId =
                            knownAssertionIdsForNewTest[assertionIndex];

                        // Unknown assertion when compared with last version
                        const oldAssertionResult =
                            assertionResultsByAssertionIds[rawAssertionId];
                        if (!oldAssertionResult) {
                            newTestResult.completedAt = null;
                            continue;
                        }

                        eachAssertionResult.passed = oldAssertionResult.passed;
                    }
                }

                newTestResults.push(newTestResult);
            }

            // Run updated metrics calculations for new TestPlanRun test results to be used in metrics calculations
            await updateMetricsAndMarkedFinalAtForTestPlanReport({
                oldTestPlanReport,
                newTestPlanReport,
                testPlanRun: newTestPlanRun,
                testResults: newTestResults,
                context,
                transaction
            });
        }
    }

    updatedTestPlanReports = await getTestPlanReports({
        where: { testPlanVersionId: newTestPlanVersionId },
        testPlanRunAttributes: null,
        testPlanVersionAttributes: null,
        testPlanAttributes: null,
        userAttributes: null,
        pagination: { order: [['createdAt', 'desc']] },
        transaction
    });

    return {
        oldTestPlanVersion,
        newTestPlanReportIds,
        updatedTestPlanReports
    };
};

module.exports = processCopiedReports;
