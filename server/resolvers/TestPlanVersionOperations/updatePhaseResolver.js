const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanReport,
    getTestPlanReports,
    // getOrCreateTestPlanReport,
    removeTestPlanReport
} = require('../../models/services.deprecated/TestPlanReportService');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const recommendedPhaseTargetDateResolver = require('../TestPlanVersion/recommendedPhaseTargetDateResolver');
const populateData = require('../../services/PopulatedData/populateData');
const { getMetrics } = require('shared');
// const { hashTest } = require('../../util/aria');
const {
    // getTestPlanVersionById,
    updateTestPlanVersion
} = require('../../models/services.deprecated/TestPlanVersionService');
// const {
//     createTestPlanRun,
//     updateTestPlanRun
// } = require('../../models/services.deprecated/TestPlanRunService');
// const {
//     createTestResultId,
//     createScenarioResultId,
//     createAssertionResultId
// } = require('../../services/PopulatedData/locationOfDataId');
const AtLoader = require('../../models/loaders/AtLoader');
const processCopiedReports = require('../helpers/processCopiedReports');

const updatePhaseResolver = async (
    { parentContext: { id: testPlanVersionId } },
    {
        phase,
        candidatePhaseReachedAt,
        recommendedPhaseTargetDate,
        testPlanVersionDataToIncludeId
    },
    context
) => {
    const { user } = context;
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    // Immediately deprecate version without further checks
    if (phase === 'DEPRECATED') {
        await updateTestPlanVersion(testPlanVersionId, {
            phase,
            deprecatedAt: new Date()
        });
        return populateData({ testPlanVersionId }, { context });
    }

    // The testPlanVersion being updated
    // const testPlanVersion = await getTestPlanVersionById(testPlanVersionId);

    // The test plan reports which will be updated
    let testPlanReports = await getTestPlanReports(
        null,
        { testPlanVersionId },
        null,
        null,
        null,
        null,
        null,
        null,
        {
            order: [['createdAt', 'desc']]
        }
    );

    const { newTestPlanReportIds, updatedTestPlanReports } =
        await processCopiedReports({
            oldTestPlanVersionId: testPlanVersionDataToIncludeId,
            newTestPlanVersionId: testPlanVersionId,
            newTestPlanReports: testPlanReports,
            context
        });
    if (updatedTestPlanReports) testPlanReports = updatedTestPlanReports;

    // let oldTestPlanVersion;
    // let oldTestPlanReports = [];
    // let newTestPlanReportIds = [];
    //
    // // These checks are needed to support the test plan version reports being updated with earlier
    // // versions' data
    // if (testPlanVersionDataToIncludeId) {
    //     oldTestPlanVersion = await getTestPlanVersionById(
    //         testPlanVersionDataToIncludeId
    //     );
    //
    //     oldTestPlanReports = await getTestPlanReports(
    //         null,
    //         {
    //             testPlanVersionId: testPlanVersionDataToIncludeId
    //         },
    //         null,
    //         null,
    //         null,
    //         null,
    //         null,
    //         null,
    //         {
    //             order: [['createdAt', 'desc']]
    //         }
    //     );
    // }
    //
    // // If there is an earlier version that for this phase and that version has some test plan runs
    // // in the test queue, this will run the process for updating existing test plan versions for the
    // // test plan version and preserving data for tests that have not changed.
    // if (oldTestPlanReports.length) {
    //     const forUpdateCompare = true;
    //
    //     for (const oldTestPlanReport of oldTestPlanReports) {
    //         // Verify the combination does not exist
    //         if (
    //             !testPlanReports.some(
    //                 ({ atId, browserId }) =>
    //                     atId === oldTestPlanReport.atId &&
    //                     browserId === oldTestPlanReport.browserId
    //             )
    //         ) {
    //             // Then this combination needs to be considered if the tests are not different
    //             // between versions
    //             let keptTestIds = {};
    //             for (const newTestPlanVersionTest of testPlanVersion.tests) {
    //                 // Found odd instances of rowNumber being an int instead of being how it
    //                 // currently is; imported as a string
    //                 // Ensuring proper hashes are done here
    //                 const newTestPlanVersionTestHash = hashTest(
    //                     {
    //                         ...newTestPlanVersionTest,
    //                         rowNumber: String(newTestPlanVersionTest.rowNumber)
    //                     },
    //                     { forUpdateCompare }
    //                 );
    //
    //                 if (keptTestIds[newTestPlanVersionTestHash]) continue;
    //
    //                 for (const oldTestPlanVersionTest of oldTestPlanVersion.tests) {
    //                     const oldTestPlanVersionTestHash = hashTest(
    //                         {
    //                             ...oldTestPlanVersionTest,
    //                             rowNumber: String(
    //                                 oldTestPlanVersionTest.rowNumber
    //                             )
    //                         },
    //                         { forUpdateCompare }
    //                     );
    //
    //                     // For each assertion under the test, check if there is a matching
    //                     // assertion. If the assertion matches, preserve the previous result,
    //                     // otherwise mark the test as not being complete
    //                     const knownAssertionIdsForOldTest = [];
    //                     for (const oldTestPlanVersionAssertion of oldTestPlanVersionTest.assertions) {
    //                         if (oldTestPlanVersionAssertion.assertionId)
    //                             knownAssertionIdsForOldTest.push(
    //                                 oldTestPlanVersionAssertion.assertionId
    //                             );
    //                     }
    //
    //                     if (
    //                         newTestPlanVersionTestHash ===
    //                         oldTestPlanVersionTestHash
    //                     ) {
    //                         if (!keptTestIds[newTestPlanVersionTestHash])
    //                             keptTestIds[newTestPlanVersionTestHash] = {
    //                                 newTestPlanVersionTestId:
    //                                     newTestPlanVersionTest.id,
    //                                 oldTestPlanVersionTestId:
    //                                     oldTestPlanVersionTest.id,
    //                                 knownAssertionIdsForOldTest
    //                             };
    //                     }
    //                 }
    //             }
    //
    //             for (const oldTestPlanRun of oldTestPlanReport.testPlanRuns) {
    //                 const newTestResultsToSaveByTestId = {};
    //                 for (const oldTestResult of oldTestPlanRun.testResults) {
    //                     // Check if the testId referenced also matches the hash on any in the
    //                     // keptTestIds
    //                     Object.keys(keptTestIds).forEach(key => {
    //                         const {
    //                             newTestPlanVersionTestId,
    //                             oldTestPlanVersionTestId,
    //                             knownAssertionIdsForOldTest
    //                         } = keptTestIds[key];
    //
    //                         if (
    //                             oldTestPlanVersionTestId ===
    //                             oldTestResult.testId
    //                         ) {
    //                             // Then this data should be preserved
    //                             newTestResultsToSaveByTestId[
    //                                 newTestPlanVersionTestId
    //                             ] = {
    //                                 ...oldTestResult,
    //                                 knownAssertionIdsForOldTest
    //                             };
    //                         } else {
    //                             // TODO: Return information on which tests cannot be preserved
    //                         }
    //                     });
    //                 }
    //
    //                 if (Object.keys(newTestResultsToSaveByTestId).length) {
    //                     const [newTestPlanReport] =
    //                         await getOrCreateTestPlanReport({
    //                             testPlanVersionId,
    //                             atId: oldTestPlanReport.atId,
    //                             browserId: oldTestPlanReport.browserId
    //                         });
    //
    //                     newTestPlanReportIds.push(newTestPlanReport.id);
    //
    //                     const newTestPlanRun = await createTestPlanRun({
    //                         testerUserId: oldTestPlanRun.testerUserId,
    //                         testPlanReportId: newTestPlanReport.id
    //                     });
    //
    //                     const newTestResults = [];
    //                     for (const testResultToSaveTestId of Object.keys(
    //                         newTestResultsToSaveByTestId
    //                     )) {
    //                         const foundKeptNewTest = testPlanVersion.tests.find(
    //                             test => test.id === testResultToSaveTestId
    //                         );
    //
    //                         let newTestResult =
    //                             newTestResultsToSaveByTestId[
    //                                 testResultToSaveTestId
    //                             ];
    //
    //                         const knownAssertionIdsForOldTest = [
    //                             ...newTestResult.knownAssertionIdsForOldTest
    //                         ];
    //                         delete newTestResult.knownAssertionIdsForOldTest;
    //
    //                         // Updating testResult id references
    //                         const newTestResultId = createTestResultId(
    //                             newTestPlanRun.id,
    //                             testResultToSaveTestId
    //                         );
    //
    //                         newTestResult.testId = testResultToSaveTestId;
    //                         newTestResult.id = newTestResultId;
    //
    //                         // TODO: Check if scenario has changed (if command added or removed for
    //                         //  a test). @func testHash function would have to relax constraints on
    //                         //  'scenarios' attribute
    //
    //                         // The hash confirms the scenario (commands) arrays should be in the same
    //                         // order, and regenerate the test result related ids for the carried
    //                         // over data
    //                         for (let [
    //                             scenarioIndex,
    //                             eachScenarioResult
    //                         ] of newTestResult.scenarioResults.entries()) {
    //                             eachScenarioResult.scenarioId =
    //                                 foundKeptNewTest.scenarios.filter(
    //                                     scenario =>
    //                                         scenario.atId ===
    //                                         oldTestPlanReport.atId
    //                                 )[scenarioIndex].id;
    //
    //                             // Update eachScenarioResult.id
    //                             const scenarioResultId = createScenarioResultId(
    //                                 newTestResultId,
    //                                 eachScenarioResult.scenarioId
    //                             );
    //                             eachScenarioResult.id = scenarioResultId;
    //
    //                             for (let [
    //                                 assertionIndex,
    //                                 eachAssertionResult
    //                             ] of eachScenarioResult.assertionResults.entries()) {
    //                                 eachAssertionResult.assertionId =
    //                                     foundKeptNewTest.assertions[
    //                                         assertionIndex
    //                                     ].id;
    //
    //                                 // Update eachAssertionResult.id
    //                                 eachAssertionResult.id =
    //                                     createAssertionResultId(
    //                                         scenarioResultId,
    //                                         eachAssertionResult.assertionId
    //                                     );
    //
    //                                 // Nullify 'passed' value and mark the test as not completed
    //                                 if (
    //                                     knownAssertionIdsForOldTest[
    //                                         assertionIndex
    //                                     ] !==
    //                                     foundKeptNewTest.assertions[
    //                                         assertionIndex
    //                                     ].assertionId
    //                                 ) {
    //                                     eachAssertionResult.passed = null;
    //                                     newTestResult.completedAt = null;
    //                                 }
    //                             }
    //                         }
    //
    //                         newTestResults.push(newTestResult);
    //                     }
    //
    //                     // Update TestPlanRun test results to be used in metrics evaluation
    //                     // afterward
    //                     await updateTestPlanRun(newTestPlanRun.id, {
    //                         testResults: newTestResults
    //                     });
    //
    //                     // Update metrics for TestPlanReport
    //                     const { testPlanReport: populatedTestPlanReport } =
    //                         await populateData(
    //                             { testPlanReportId: newTestPlanReport.id },
    //                             { context }
    //                         );
    //
    //                     const runnableTests = runnableTestsResolver(
    //                         populatedTestPlanReport
    //                     );
    //                     let updateParams = {};
    //
    //                     // Mark the report as final if previously was for TestPlanVersion being deprecated; may still be
    //                     // nullified if finalized test results aren't equal to the amount known number of possible
    //                     // runnable tests, because no tests should be skipped. Would mean it CANNOT be final.
    //                     if (oldTestPlanReport.markedFinalAt)
    //                         updateParams = { markedFinalAt: new Date() };
    //
    //                     // Calculate the metrics (happens if updating to DRAFT)
    //                     const conflicts = await conflictsResolver(
    //                         populatedTestPlanReport
    //                     );
    //
    //                     if (conflicts.length > 0) {
    //                         // Then no chance to have finalized reports, and means it hasn't been
    //                         // marked as final yet
    //                         updateParams = {
    //                             ...updateParams,
    //                             markedFinalAt: null,
    //                             metrics: {
    //                                 ...populatedTestPlanReport.metrics,
    //                                 conflictsCount: conflicts.length
    //                             }
    //                         };
    //                     } else {
    //                         const finalizedTestResults =
    //                             await finalizedTestResultsResolver(
    //                                 populatedTestPlanReport,
    //                                 null,
    //                                 context
    //                             );
    //
    //                         if (
    //                             !finalizedTestResults ||
    //                             !finalizedTestResults.length
    //                         ) {
    //                             updateParams = {
    //                                 ...updateParams,
    //                                 markedFinalAt: null,
    //                                 metrics: {
    //                                     ...populatedTestPlanReport.metrics
    //                                 }
    //                             };
    //                         } else {
    //                             const metrics = getMetrics({
    //                                 testPlanReport: {
    //                                     ...populatedTestPlanReport,
    //                                     finalizedTestResults,
    //                                     runnableTests
    //                                 }
    //                             });
    //
    //                             updateParams = {
    //                                 ...updateParams,
    //                                 // means test results have now been 'skipped' during the update process so these
    //                                 // cannot be finalized and must be updated in the test queue
    //                                 markedFinalAt:
    //                                     finalizedTestResults.length <
    //                                     runnableTests.length
    //                                         ? null
    //                                         : updateParams.markedFinalAt,
    //                                 metrics: {
    //                                     ...populatedTestPlanReport.metrics,
    //                                     ...metrics
    //                                 }
    //                             };
    //                         }
    //                     }
    //
    //                     await updateTestPlanReport(
    //                         populatedTestPlanReport.id,
    //                         updateParams
    //                     );
    //                 }
    //             }
    //         }
    //     }
    //
    //     testPlanReports = await getTestPlanReports(
    //         null,
    //         { testPlanVersionId },
    //         null,
    //         null,
    //         null,
    //         undefined,
    //         undefined,
    //         null,
    //         {
    //             order: [['createdAt', 'desc']]
    //         }
    //     );
    // }

    if (
        testPlanReports.length === 0 &&
        (phase === 'CANDIDATE' || phase === 'RECOMMENDED')
    ) {
        // Stop update if no testPlanReports were found
        throw new Error('No test plan reports found.');
    }

    // If there is at least one report that wasn't created by the old reports then do the exception
    // check
    if (testPlanReports.some(({ id }) => !newTestPlanReportIds.includes(id))) {
        if (
            !testPlanReports.some(({ markedFinalAt }) => markedFinalAt) &&
            (phase === 'CANDIDATE' || phase === 'RECOMMENDED')
        ) {
            // Throw away newly created test plan reports if exception was hit
            if (newTestPlanReportIds.length)
                for (const createdTestPlanReportId of newTestPlanReportIds) {
                    await removeTestPlanReport(createdTestPlanReportId);
                }

            // Do not update phase if no reports marked as final were found
            throw new Error('No reports have been marked as final.');
        }
    }

    if (phase === 'CANDIDATE') {
        const reportsByAtAndBrowser = {};

        testPlanReports
            // Only check for reports which have been marked as final
            .filter(testPlanReport => !!testPlanReport.markedFinalAt)
            .forEach(testPlanReport => {
                const { at, browser } = testPlanReport;
                if (!reportsByAtAndBrowser[at.id]) {
                    reportsByAtAndBrowser[at.id] = {};
                }

                reportsByAtAndBrowser[at.id][browser.id] = testPlanReport;
            });

        const atLoader = AtLoader();
        const ats = await atLoader.getAll();

        const missingAtBrowserCombinations = [];

        ats.forEach(at => {
            const browsers =
                phase === 'CANDIDATE'
                    ? at.candidateBrowsers
                    : at.recommendedBrowsers;
            browsers.forEach(browser => {
                if (!reportsByAtAndBrowser[at.id]?.[browser.id]) {
                    missingAtBrowserCombinations.push(
                        `${at.name} and ${browser.name}`
                    );
                }
            });
        });

        if (missingAtBrowserCombinations.length) {
            // Throw away newly created test plan reports if exception was hit
            if (newTestPlanReportIds.length)
                for (const createdTestPlanReportId of newTestPlanReportIds) {
                    await removeTestPlanReport(createdTestPlanReportId);
                }

            throw new Error(
                `Cannot set phase to ${phase.toLowerCase()} because the following` +
                    ` required reports have not been collected or finalized:` +
                    ` ${missingAtBrowserCombinations.join(', ')}.`
            );
        }
    }

    for (const testPlanReport of testPlanReports) {
        const runnableTests = runnableTestsResolver(testPlanReport);
        let updateParams = {};

        const isReportCreatedFromOldResults = newTestPlanReportIds.includes(
            testPlanReport.id
        );

        if (phase === 'DRAFT') {
            const conflicts = await conflictsResolver(testPlanReport);

            updateParams = {
                metrics: {
                    ...testPlanReport.metrics,
                    conflictsCount: conflicts.length
                }
            };

            // Nullify markedFinalAt if not using old result
            if (!isReportCreatedFromOldResults)
                updateParams = { ...updateParams, markedFinalAt: null };

            await updateTestPlanReport(testPlanReport.id, updateParams);
        }

        const shouldThrowErrorIfFound =
            (phase === 'CANDIDATE' || phase === 'RECOMMENDED') &&
            isReportCreatedFromOldResults
                ? false
                : testPlanReport.markedFinalAt;

        if (shouldThrowErrorIfFound) {
            const conflicts = await conflictsResolver(testPlanReport);
            if (conflicts.length > 0) {
                // Throw away newly created test plan reports if exception was hit
                if (newTestPlanReportIds.length)
                    for (const createdTestPlanReportId of newTestPlanReportIds) {
                        await removeTestPlanReport(createdTestPlanReportId);
                    }

                throw new Error(
                    'Cannot update test plan report due to conflicts'
                );
            }

            const finalizedTestResults = await finalizedTestResultsResolver(
                testPlanReport,
                null,
                context
            );

            if (!finalizedTestResults || !finalizedTestResults.length) {
                // Throw away newly created test plan reports if exception was hit
                if (newTestPlanReportIds.length)
                    for (const createdTestPlanReportId of newTestPlanReportIds) {
                        await removeTestPlanReport(createdTestPlanReportId);
                    }

                throw new Error(
                    'Cannot update test plan report because there are no ' +
                        'completed test results'
                );
            }

            const metrics = getMetrics({
                testPlanReport: {
                    ...testPlanReport,
                    finalizedTestResults,
                    runnableTests
                }
            });

            if (phase === 'CANDIDATE') {
                updateParams = {
                    ...updateParams,
                    metrics: { ...testPlanReport.metrics, ...metrics },
                    vendorReviewStatus: 'READY'
                };
            } else if (phase === 'RECOMMENDED') {
                updateParams = {
                    ...updateParams,
                    metrics: { ...testPlanReport.metrics, ...metrics }
                };
            }
        }
        await updateTestPlanReport(testPlanReport.id, updateParams);
    }

    let updateParams = { phase };
    if (phase === 'RD')
        updateParams = {
            ...updateParams,
            draftPhaseReachedAt: null,
            candidatePhaseReachedAt: null,
            recommendedPhaseReachedAt: null,
            recommendedPhaseTargetDate: null,
            deprecatedAt: null
        };
    else if (phase === 'DRAFT')
        updateParams = {
            ...updateParams,
            draftPhaseReachedAt: new Date(),
            candidatePhaseReachedAt: null,
            recommendedPhaseReachedAt: null,
            recommendedPhaseTargetDate: null,
            deprecatedAt: null
        };
    else if (phase === 'CANDIDATE') {
        const candidatePhaseReachedAtValue =
            candidatePhaseReachedAt || new Date();
        const recommendedPhaseTargetDateValue =
            recommendedPhaseTargetDate ||
            recommendedPhaseTargetDateResolver({
                candidatePhaseReachedAt: candidatePhaseReachedAtValue
            });
        updateParams = {
            ...updateParams,
            candidatePhaseReachedAt: candidatePhaseReachedAtValue,
            recommendedPhaseReachedAt: null,
            recommendedPhaseTargetDate: recommendedPhaseTargetDateValue,
            deprecatedAt: null
        };
    } else if (phase === 'RECOMMENDED')
        updateParams = {
            ...updateParams,
            recommendedPhaseReachedAt: new Date(),
            deprecatedAt: null
        };

    // If testPlanVersionDataToIncludeId's results are being used to update this earlier version,
    // deprecate it
    if (testPlanVersionDataToIncludeId)
        await updateTestPlanVersion(testPlanVersionDataToIncludeId, {
            phase: 'DEPRECATED',
            deprecatedAt: new Date()
        });

    await updateTestPlanVersion(testPlanVersionId, updateParams);
    return populateData({ testPlanVersionId });
};

module.exports = updatePhaseResolver;
