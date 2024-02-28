const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanReportById,
    getTestPlanReports,
    getOrCreateTestPlanReport,
    removeTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const recommendedPhaseTargetDateResolver = require('../TestPlanVersion/recommendedPhaseTargetDateResolver');
const populateData = require('../../services/PopulatedData/populateData');
const getMetrics = require('../../util/getMetrics');
const { hashTest } = require('../../util/aria');
const {
    getTestPlanVersionById,
    updateTestPlanVersionById
} = require('../../models/services/TestPlanVersionService');
const {
    createTestPlanRun,
    updateTestPlanRunById
} = require('../../models/services/TestPlanRunService');
const {
    createTestResultId,
    createScenarioResultId,
    createAssertionResultId
} = require('../../services/PopulatedData/locationOfDataId');
const AtLoader = require('../../models/loaders/AtLoader');

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
    const { user, transaction } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    // Immediately deprecate version without further checks
    if (phase === 'DEPRECATED') {
        await updateTestPlanVersionById({
            id: testPlanVersionId,
            values: { phase, deprecatedAt: new Date() },
            transaction
        });
        return populateData({ testPlanVersionId }, { transaction });
    }

    let testPlanVersionDataToInclude;
    let testPlanReportsDataToIncludeId = [];
    let createdTestPlanReportIdsFromOldResults = [];

    // The testPlanVersion being updated
    const testPlanVersion = await getTestPlanVersionById({
        id: testPlanVersionId,
        transaction
    });

    // These checks are needed to support the test plan version reports being updated with earlier
    // versions' data
    if (testPlanVersionDataToIncludeId) {
        testPlanVersionDataToInclude = await getTestPlanVersionById({
            id: testPlanVersionDataToIncludeId,
            transaction
        });

        const whereTestPlanVersion = {
            testPlanVersionId: testPlanVersionDataToIncludeId
        };

        testPlanReportsDataToIncludeId = await getTestPlanReports({
            where: whereTestPlanVersion,
            pagination: { order: [['createdAt', 'desc']] },
            transaction
        });
    }

    // The test plan reports which will be updated
    let testPlanReports;
    const whereTestPlanVersion = {
        testPlanVersionId
    };
    testPlanReports = await getTestPlanReports({
        where: whereTestPlanVersion,
        pagination: { order: [['createdAt', 'desc']] },
        transaction
    });

    // If there is an earlier version that for this phase and that version has some test plan runs
    // in the test queue, this will run the process for updating existing test plan versions for the
    // test plan version and preserving data for tests that have not changed.
    if (testPlanReportsDataToIncludeId.length) {
        for (const testPlanReportDataToInclude of testPlanReportsDataToIncludeId) {
            // Verify the combination does not exist
            if (
                !testPlanReports.some(
                    ({ atId, browserId }) =>
                        atId === testPlanReportDataToInclude.atId &&
                        browserId === testPlanReportDataToInclude.browserId
                )
            ) {
                // Then this combination needs to be considered if the tests are not different
                // between versions
                let keptTestIds = {};
                for (const testPlanVersionTest of testPlanVersion.tests) {
                    // Found odd instances of rowNumber being an int instead of being how it
                    // currently is; imported as a string
                    // Ensuring proper hashes are done here
                    const testHash = hashTest({
                        ...testPlanVersionTest,
                        rowNumber: String(testPlanVersionTest.rowNumber)
                    });

                    if (keptTestIds[testHash]) continue;

                    for (const testPlanVersionDataToIncludeTest of testPlanVersionDataToInclude.tests) {
                        const testDataToIncludeHash = hashTest({
                            ...testPlanVersionDataToIncludeTest,
                            rowNumber: String(
                                testPlanVersionDataToIncludeTest.rowNumber
                            )
                        });

                        if (testHash === testDataToIncludeHash) {
                            if (!keptTestIds[testHash])
                                keptTestIds[testHash] = {
                                    testId: testPlanVersionTest.id,
                                    testDataToIncludeId:
                                        testPlanVersionDataToIncludeTest.id
                                };
                        }
                    }
                }

                for (const testPlanRun of testPlanReportDataToInclude.testPlanRuns) {
                    const testResultsToSave = {};
                    for (const testResult of testPlanRun.testResults) {
                        // Check if the testId referenced also matches the hash on any in the
                        // keptTestIds
                        Object.keys(keptTestIds).forEach(key => {
                            const { testId, testDataToIncludeId } =
                                keptTestIds[key];

                            if (testDataToIncludeId === testResult.testId) {
                                // Then this data should be preserved
                                testResultsToSave[testId] = testResult;
                            } else {
                                // TODO: Return information on which tests cannot be preserved
                            }
                        });
                    }

                    if (Object.keys(testResultsToSave).length) {
                        const [createdTestPlanReport] =
                            await getOrCreateTestPlanReport({
                                where: {
                                    testPlanVersionId,
                                    atId: testPlanReportDataToInclude.atId,
                                    browserId:
                                        testPlanReportDataToInclude.browserId
                                },
                                transaction
                            });

                        createdTestPlanReportIdsFromOldResults.push(
                            createdTestPlanReport.id
                        );

                        const createdTestPlanRun = await createTestPlanRun({
                            values: {
                                testerUserId: testPlanRun.testerUserId,
                                testPlanReportId: createdTestPlanReport.id
                            },
                            transaction
                        });

                        const testResults = [];
                        for (const testResultToSaveTestId of Object.keys(
                            testResultsToSave
                        )) {
                            const foundKeptTest = testPlanVersion.tests.find(
                                test => test.id === testResultToSaveTestId
                            );

                            let testResultToSave =
                                testResultsToSave[testResultToSaveTestId];

                            // Updating testResult id references
                            const testResultId = createTestResultId(
                                createdTestPlanRun.id,
                                testResultToSaveTestId
                            );

                            testResultToSave.testId = testResultToSaveTestId;
                            testResultToSave.id = testResultId;

                            // The hash confirms the sub-arrays should be in the same order, and
                            // regenerate the test result related ids for the carried over data
                            testResultToSave.scenarioResults.forEach(
                                (eachScenarioResult, scenarioIndex) => {
                                    eachScenarioResult.scenarioId =
                                        foundKeptTest.scenarios.filter(
                                            scenario =>
                                                scenario.atId ===
                                                testPlanReportDataToInclude.atId
                                        )[scenarioIndex].id;

                                    // Update eachScenarioResult.id
                                    const scenarioResultId =
                                        createScenarioResultId(
                                            testResultId,
                                            eachScenarioResult.scenarioId
                                        );
                                    eachScenarioResult.id = scenarioResultId;

                                    eachScenarioResult.assertionResults.forEach(
                                        (
                                            eachAssertionResult,
                                            assertionIndex
                                        ) => {
                                            eachAssertionResult.assertionId =
                                                foundKeptTest.assertions[
                                                    assertionIndex
                                                ].id;

                                            // Update eachAssertionResult.id
                                            eachAssertionResult.id =
                                                createAssertionResultId(
                                                    scenarioResultId,
                                                    eachAssertionResult.assertionId
                                                );
                                        }
                                    );
                                }
                            );

                            testResults.push(testResultToSave);
                        }

                        // Update TestPlanRun test results to be used in metrics evaluation
                        // afterward
                        await updateTestPlanRunById({
                            id: createdTestPlanRun.id,
                            values: { testResults },
                            transaction
                        });

                        // Update metrics for TestPlanReport
                        const { testPlanReport: populatedTestPlanReport } =
                            await populateData(
                                { testPlanReportId: createdTestPlanReport.id },
                                { transaction }
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
                        if (testPlanReportDataToInclude.markedFinalAt)
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
                            const finalizedTestResults =
                                await finalizedTestResultsResolver(
                                    populatedTestPlanReport,
                                    null,
                                    context
                                );

                            if (
                                !finalizedTestResults ||
                                !finalizedTestResults.length
                            ) {
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
                                        finalizedTestResults.length <
                                        runnableTests.length
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
                    }
                }
            }
        }

        testPlanReports = await getTestPlanReports({
            where: whereTestPlanVersion,
            pagination: { order: [['createdAt', 'desc']] },
            transaction
        });
    }

    if (
        testPlanReports.length === 0 &&
        (phase === 'CANDIDATE' || phase === 'RECOMMENDED')
    ) {
        // Stop update if no testPlanReports were found
        throw new Error('No test plan reports found.');
    }

    // If there is at least one report that wasn't created by the old reports then do the exception
    // check
    if (
        testPlanReports.some(
            ({ id }) => !createdTestPlanReportIdsFromOldResults.includes(id)
        )
    ) {
        if (
            !testPlanReports.some(({ markedFinalAt }) => markedFinalAt) &&
            (phase === 'CANDIDATE' || phase === 'RECOMMENDED')
        ) {
            // Throw away newly created test plan reports if exception was hit
            if (createdTestPlanReportIdsFromOldResults.length)
                for (const createdTestPlanReportId of createdTestPlanReportIdsFromOldResults) {
                    await removeTestPlanReportById({
                        id: createdTestPlanReportId,
                        transaction
                    });
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
        const ats = await atLoader.getAll({ transaction });

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
            if (createdTestPlanReportIdsFromOldResults.length)
                for (const createdTestPlanReportId of createdTestPlanReportIdsFromOldResults) {
                    await removeTestPlanReportById({
                        id: createdTestPlanReportId,
                        transaction
                    });
                }

            throw new Error(
                `Cannot set phase to ${phase.toLowerCase()} because the following` +
                    ` required reports have not been collected or finalized:` +
                    ` ${missingAtBrowserCombinations.join(', ')}.`
            );
        }
    }

    for (const testPlanReport of testPlanReports) {
        const runnableTests = runnableTestsResolver(
            testPlanReport,
            null,
            context
        );
        let updateParams = {};

        const isReportCreatedFromOldResults =
            createdTestPlanReportIdsFromOldResults.includes(testPlanReport.id);

        if (phase === 'DRAFT') {
            const conflicts = await conflictsResolver(
                testPlanReport,
                null,
                context
            );

            updateParams = {
                metrics: {
                    ...testPlanReport.metrics,
                    conflictsCount: conflicts.length
                }
            };

            // Nullify markedFinalAt if not using old result
            if (!isReportCreatedFromOldResults)
                updateParams = { ...updateParams, markedFinalAt: null };

            await updateTestPlanReportById({
                id: testPlanReport.id,
                values: updateParams,
                transaction
            });
        }

        const shouldThrowErrorIfFound =
            (phase === 'CANDIDATE' || phase === 'RECOMMENDED') &&
            isReportCreatedFromOldResults
                ? false
                : testPlanReport.markedFinalAt;

        if (shouldThrowErrorIfFound) {
            const conflicts = await conflictsResolver(
                testPlanReport,
                null,
                context
            );
            if (conflicts.length > 0) {
                // Throw away newly created test plan reports if exception was hit
                if (createdTestPlanReportIdsFromOldResults.length)
                    for (const createdTestPlanReportId of createdTestPlanReportIdsFromOldResults) {
                        await removeTestPlanReportById({
                            id: createdTestPlanReportId,
                            transaction
                        });
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
                if (createdTestPlanReportIdsFromOldResults.length)
                    for (const createdTestPlanReportId of createdTestPlanReportIdsFromOldResults) {
                        await removeTestPlanReportById({
                            id: createdTestPlanReportId,
                            transaction
                        });
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
        await updateTestPlanReportById({
            id: testPlanReport.id,
            values: updateParams,
            transaction
        });
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
            recommendedPhaseTargetDateResolver(
                { candidatePhaseReachedAt: candidatePhaseReachedAtValue },
                null,
                context
            );
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
        await updateTestPlanVersionById({
            id: testPlanVersionDataToIncludeId,
            values: { phase: 'DEPRECATED', deprecatedAt: new Date() },
            transaction
        });

    await updateTestPlanVersionById({
        id: testPlanVersionId,
        values: updateParams,
        transaction
    });
    return populateData({ testPlanVersionId }, { transaction });
};

module.exports = updatePhaseResolver;
