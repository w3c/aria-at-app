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

    const testPlanVersion = await getTestPlanVersionById(testPlanVersionId);

    if (testPlanVersionDataToIncludeId) {
        testPlanVersionDataToInclude = await getTestPlanVersionById(
            testPlanVersionDataToIncludeId
        );

        const whereTestPlanVersion = {
            testPlanVersionId: testPlanVersionDataToIncludeId
        };
        // whereTestPlanVersion.status = testPlanVersion.phase;

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

    // Move only the TestPlanReports which also have the same phase as the TestPlanVersion
    const whereTestPlanVersion = {
        testPlanVersionId
    };
    // whereTestPlanVersion.status = testPlanVersion.phase;
    let testPlanReports;

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

    // Params to be updated on TestPlanVersion (or TestPlanReports)
    let updateParams = { phase, status: phase };

    if (testPlanReportsDataToIncludeId.length) {
        for (const testPlanReportWithDataToInclude of testPlanReportsDataToIncludeId) {
            // Verify the combination does not exist
            if (
                !testPlanReports.some(
                    ({ atId, browserId }) =>
                        atId === testPlanReportWithDataToInclude.atId &&
                        browserId === testPlanReportWithDataToInclude.browserId
                )
            ) {
                // Then this combination needs to be added if the tests are not different between
                // versions
                let keptTestIds = {};
                for (const testPlanVersionTest of testPlanVersion.tests) {
                    const testHash = hashTest(testPlanVersionTest);

                    if (keptTestIds[testHash]) continue;

                    for (const testPlanVersionWithDataToIncludeTest of testPlanVersionDataToInclude.tests) {
                        const testWithIncludedDataHash = hashTest(
                            testPlanVersionWithDataToIncludeTest
                        );

                        if (testHash === testWithIncludedDataHash) {
                            if (!keptTestIds[testHash])
                                keptTestIds[testHash] = {
                                    testId: testPlanVersionTest.id,
                                    testWithDataId:
                                        testPlanVersionWithDataToIncludeTest.id
                                };
                        }
                    }
                }

                for (const testPlanRun of testPlanReportWithDataToInclude.testPlanRuns) {
                    const testsToKeep = {};
                    for (const testResult of testPlanRun.testResults) {
                        // Check if the testId referenced also matches the hash on any in the
                        // keptTestIds
                        Object.keys(keptTestIds).forEach(key => {
                            const { testId, testWithDataId } = keptTestIds[key];

                            if (testWithDataId === testResult.testId) {
                                // Then this data should be preserved
                                testsToKeep[testId] = testResult;
                            } else {
                                // TODO: Track which tests cannot be preserved
                            }
                        });
                    }

                    if (Object.keys(testsToKeep).length) {
                        const [createdTestPlanReport] =
                            await getOrCreateTestPlanReport({
                                testPlanVersionId,
                                atId: testPlanReportWithDataToInclude.atId,
                                browserId:
                                    testPlanReportWithDataToInclude.browserId
                            });

                        const createdTestPlanRun = await createTestPlanRun({
                            testerUserId: testPlanRun.testerUserId,
                            testPlanReportId: createdTestPlanReport.id
                        });

                        const testResults = [];
                        for (const updatedTestId of Object.keys(testsToKeep)) {
                            const foundKeptTest = testPlanVersion.tests.find(
                                test => test.id === updatedTestId
                            );

                            let testResultToSave = testsToKeep[updatedTestId];

                            // Updating testResult id references
                            const testResultId = createTestResultId(
                                createdTestPlanRun.id,
                                updatedTestId
                            );

                            testResultToSave.testId = updatedTestId;
                            testResultToSave.id = testResultId;

                            // The hash confirms the sub-arrays should be in the same order
                            testResultToSave.scenarioResults.forEach(
                                (eachScenarioResult, scenarioIndex) => {
                                    eachScenarioResult.scenarioId =
                                        foundKeptTest.scenarios.filter(
                                            scenario =>
                                                scenario.atId ===
                                                testPlanReportWithDataToInclude.atId
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
            null,
            null,
            null,
            {
                order: [['createdAt', 'desc']]
            }
        );
    }

    for (const testPlanReport of testPlanReports) {
        const runnableTests = runnableTestsResolver(testPlanReport);

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
                }
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

    if (phase === 'RD')
        updateParams = {
            ...updateParams,
            draftPhaseReachedAt: null,
            candidatePhaseReachedAt: null,
            recommendedPhaseReachedAt: null,
            recommendedPhaseTargetDate: null
        };
    else if (phase === 'DRAFT')
        // TODO: If there is an earlier version that is draft and that version has some test plan runs
        //  in the test queue, this button will run the process for updating existing reports and
        //  preserving data for tests that have not changed.
        updateParams = {
            ...updateParams,
            draftPhaseReachedAt: new Date(),
            candidatePhaseReachedAt: null,
            recommendedPhaseReachedAt: null,
            recommendedPhaseTargetDate: null
        };
    else if (phase === 'CANDIDATE') {
        // TODO: If there is an earlier version that is candidate and that version has some test
        //  plan runs in the test queue, this button will run the process for updating existing
        //  reports and preserving data for tests that have not changed.
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
            recommendedPhaseTargetDate: recommendedPhaseTargetDateValue
        };
    } else if (phase === 'RECOMMENDED')
        // TODO: If there is an earlier version that is recommended and that version has some test
        //  plan runs in the test queue, this button will run the process for updating existing
        //  reports and preserving data for tests that have not changed.
        updateParams = {
            ...updateParams,
            recommendedPhaseReachedAt: new Date()
        };

    await updateTestPlanVersion(testPlanVersionId, updateParams);
    return populateData({ testPlanVersionId }, { context });
};

module.exports = updatePhaseResolver;
