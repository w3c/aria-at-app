const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanReport,
    getTestPlanReports,
    getOrCreateTestPlanReport
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
    updateTestPlanVersion
} = require('../../models/services/TestPlanVersionService');
const {
    createTestPlanRun,
    updateTestPlanRun
} = require('../../models/services/TestPlanRunService');
const {
    createTestResultId,
    createScenarioResultId,
    createAssertionResultId
} = require('../../services/PopulatedData/locationOfDataId');

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

    let testPlanVersionDataToInclude;
    let testPlanReportsDataToIncludeId = [];

    // The testPlanVersion being updated
    const testPlanVersion = await getTestPlanVersionById(testPlanVersionId);

    // These checks are needed to support the test plan version reports being updated with earlier
    // versions' data
    if (testPlanVersionDataToIncludeId) {
        testPlanVersionDataToInclude = await getTestPlanVersionById(
            testPlanVersionDataToIncludeId
        );

        const whereTestPlanVersion = {
            testPlanVersionId: testPlanVersionDataToIncludeId
        };

        testPlanReportsDataToIncludeId = await getTestPlanReports(
            null,
            whereTestPlanVersion,
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
    }

    // The test plan reports which will be updated
    let testPlanReports;
    const whereTestPlanVersion = {
        testPlanVersionId
    };
    testPlanReports = await getTestPlanReports(
        null,
        whereTestPlanVersion,
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
                    const testHash = hashTest(testPlanVersionTest);

                    if (keptTestIds[testHash]) continue;

                    for (const testPlanVersionDataToIncludeTest of testPlanVersionDataToInclude.tests) {
                        const testDataToIncludeHash = hashTest(
                            testPlanVersionDataToIncludeTest
                        );

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
                                // TODO: Track which tests cannot be preserved
                            }
                        });
                    }

                    if (Object.keys(testResultsToSave).length) {
                        const [createdTestPlanReport] =
                            await getOrCreateTestPlanReport({
                                testPlanVersionId,
                                atId: testPlanReportDataToInclude.atId,
                                browserId: testPlanReportDataToInclude.browserId
                            });

                        const createdTestPlanRun = await createTestPlanRun({
                            testerUserId: testPlanRun.testerUserId,
                            testPlanReportId: createdTestPlanReport.id
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

                        await updateTestPlanRun(createdTestPlanRun.id, {
                            testResults
                        });
                    }
                }
            }
        }

        testPlanReports = await getTestPlanReports(
            null,
            whereTestPlanVersion,
            null,
            null,
            null,
            undefined,
            undefined,
            null,
            {
                order: [['createdAt', 'desc']]
            }
        );
    }

    if (
        testPlanReports.length === 0 &&
        (phase === 'CANDIDATE' || phase === 'RECOMMENDED')
    ) {
        // Stop update if no testPlanReports were found
        throw new Error('No test plan reports found.');
    }

    for (const testPlanReport of testPlanReports) {
        const runnableTests = runnableTestsResolver(testPlanReport);
        let updateParams = {};

        if (phase === 'DRAFT') {
            const conflicts = await conflictsResolver(
                testPlanReport,
                null,
                context
            );
            await updateTestPlanReport(testPlanReport.id, {
                metrics: {
                    ...testPlanReport.metrics,
                    conflictsCount: conflicts.length
                },
                approvedAt: null
            });
        }

        if (phase === 'CANDIDATE' || phase === 'RECOMMENDED') {
            const conflicts = await conflictsResolver(
                testPlanReport,
                null,
                context
            );
            if (conflicts.length > 0) {
                throw new Error(
                    'Cannot update test plan report due to conflicts'
                );
            }

            const finalizedTestResults = await finalizedTestResultsResolver(
                {
                    ...testPlanReport,
                    phase,
                    status: phase
                },
                null,
                context
            );

            if (!finalizedTestResults || !finalizedTestResults.length) {
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
            archivedAtDate: null
        };
    else if (phase === 'DRAFT')
        updateParams = {
            ...updateParams,
            draftPhaseReachedAt: new Date(),
            candidatePhaseReachedAt: null,
            recommendedPhaseReachedAt: null,
            recommendedPhaseTargetDate: null,
            archivedAtDate: null
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
            archivedAtDate: null
        };
    } else if (phase === 'RECOMMENDED')
        updateParams = {
            ...updateParams,
            recommendedPhaseReachedAt: new Date(),
            archivedAtDate: null
        };

    // If testPlanVersionDataToIncludeId's results are being used to update this earlier version,
    // sunset it
    if (testPlanVersionDataToIncludeId)
        await updateTestPlanVersion(testPlanVersionDataToIncludeId, {
            archivedAtDate: new Date()
        });

    await updateTestPlanVersion(testPlanVersionId, updateParams);
    return populateData({ testPlanVersionId }, { context });
};

module.exports = updatePhaseResolver;
