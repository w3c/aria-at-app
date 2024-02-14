const hash = require('object-hash');
const { omit } = require('lodash');
const { AuthenticationError } = require('apollo-server-express');
const {
    getTestPlanReportById,
    getOrCreateTestPlanReport,
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const {
    getTestPlanVersionById
} = require('../../models/services/TestPlanVersionService');
const { testResults } = require('../TestPlanRun');
const populateData = require('../../services/PopulatedData/populateData');
const scenariosResolver = require('../Test/scenariosResolver');
const {
    createTestPlanRun
} = require('../../models/services/TestPlanRunService');
const { findOrCreateTestResult } = require('../TestPlanRunOperations');
const { submitTestResult, saveTestResult } = require('../TestResultOperations');

const compareTestContent = (currentTests, newTests) => {
    const hashTest = test => hash(omit(test, ['id']));
    const hashTests = tests => {
        return Object.fromEntries(tests.map(test => [hashTest(test), test]));
    };

    const currentTestsByHash = hashTests(currentTests);
    const newTestsByHash = hashTests(newTests);

    const testsToDelete = [];
    const currentTestIdsToNewTestIds = {};
    Object.entries(currentTestsByHash).forEach(([hash, currentTest]) => {
        const newTest = newTestsByHash[hash];
        if (!newTest) {
            testsToDelete.push(currentTest);
            return;
        }
        currentTestIdsToNewTestIds[currentTest.id] = newTest.id;
    });

    return { testsToDelete, currentTestIdsToNewTestIds };
};

const copyTestResult = (testResultSkeleton, testResult) => {
    return {
        id: testResultSkeleton.id,
        atVersionId: testResultSkeleton.atVersion.id,
        browserVersionId: testResultSkeleton.browserVersion.id,
        scenarioResults: testResultSkeleton.scenarioResults.map(
            (scenarioResultSkeleton, index) => {
                const scenarioResult = testResult.scenarioResults[index];
                return {
                    id: scenarioResultSkeleton.id,
                    output: scenarioResult.output,
                    assertionResults:
                        scenarioResultSkeleton.assertionResults.map(
                            (assertionResultSkeleton, assertionResultIndex) => {
                                const assertionResult =
                                    scenarioResult.assertionResults[
                                        assertionResultIndex
                                    ];
                                return {
                                    id: assertionResultSkeleton.id,
                                    passed: assertionResult.passed
                                };
                            }
                        ),
                    unexpectedBehaviors: scenarioResult.unexpectedBehaviors
                };
            }
        )
    };
};

const updateTestPlanReportTestPlanVersionResolver = async (
    { parentContext: { id: testPlanReportId } },
    { input }, // { testPlanVersionId, atId, browserId }
    context
) => {
    const { user } = context;
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const { testPlanVersionId: newTestPlanVersionId, atId } = input;

    // [SECTION START]: Preparing data to be worked with in a similar way to TestPlanUpdaterModal
    const newTestPlanVersionData = (
        await getTestPlanVersionById(newTestPlanVersionId)
    ).toJSON();
    const newTestPlanVersion = {
        id: newTestPlanVersionData.id,
        tests: newTestPlanVersionData.tests.map(
            ({ assertions, atMode, atIds, id, scenarios, title }) => {
                return {
                    id,
                    title,
                    ats: atIds.map(atId => ({
                        id: atId
                    })),
                    atMode,
                    scenarios: scenariosResolver({ scenarios }, { atId }).map(
                        ({ commandIds }) => {
                            return {
                                commands: commandIds.map(commandId => ({
                                    text: commandId
                                }))
                            };
                        }
                    ),
                    assertions: assertions.map(({ priority, text }) => ({
                        priority,
                        text
                    }))
                };
            }
        )
    };

    const currentTestPlanReport = (
        await getTestPlanReportById(testPlanReportId)
    ).toJSON();

    for (let i = 0; i < currentTestPlanReport.testPlanRuns.length; i++) {
        const testPlanRun = currentTestPlanReport.testPlanRuns[i];
        const { testPlanRun: populatedTestPlanRun } = await populateData({
            testPlanRunId: testPlanRun.id
        });

        testPlanRun.testResults = await testResults(
            populatedTestPlanRun.toJSON(),
            null,
            context
        );

        if (!currentTestPlanReport.draftTestPlanRuns)
            currentTestPlanReport.draftTestPlanRuns = [];
        currentTestPlanReport.draftTestPlanRuns[i] = testPlanRun;
    }

    const skeletonTestPlanReport = {
        id: currentTestPlanReport.id,
        draftTestPlanRuns: currentTestPlanReport.draftTestPlanRuns.map(
            ({ testResults, tester }) => ({
                tester: {
                    id: tester.id,
                    username: tester.username
                },
                testResults: testResults.map(
                    ({
                        atVersion,
                        browserVersion,
                        completedAt,
                        scenarioResults,
                        test
                    }) => {
                        return {
                            test: {
                                id: test.id,
                                title: test.title,
                                ats: test.ats.map(({ id }) => ({
                                    id
                                })),
                                scenarios: scenariosResolver(
                                    { scenarios: test.scenarios },
                                    { atId }
                                ).map(({ commandIds }) => {
                                    return {
                                        commands: commandIds.map(commandId => ({
                                            text: commandId
                                        }))
                                    };
                                }),
                                assertions: test.assertions.map(
                                    ({ priority, text }) => ({
                                        priority,
                                        text
                                    })
                                )
                            },
                            atVersion: { id: atVersion.id },
                            browserVersion: { id: browserVersion.id },
                            completedAt,
                            scenarioResults: scenarioResults.map(
                                ({
                                    output,
                                    assertionResults,
                                    unexpectedBehaviors
                                }) => ({
                                    output,
                                    assertionResults: assertionResults.map(
                                        ({ passed }) => ({
                                            passed
                                        })
                                    ),
                                    unexpectedBehaviors:
                                        unexpectedBehaviors?.map(
                                            ({
                                                id,
                                                otherUnexpectedBehaviorText
                                            }) => ({
                                                id,
                                                otherUnexpectedBehaviorText
                                            })
                                        )
                                })
                            )
                        };
                    }
                )
            })
        )
    };

    let runsWithResults,
        allTestResults,
        copyableTestResults,
        testsToDelete,
        currentTestIdsToNewTestIds;

    runsWithResults = skeletonTestPlanReport.draftTestPlanRuns.filter(
        testPlanRun => testPlanRun.testResults.length
    );

    allTestResults = runsWithResults.flatMap(
        testPlanRun => testPlanRun.testResults
    );

    // eslint-disable-next-line no-unused-vars
    ({ testsToDelete, currentTestIdsToNewTestIds } = compareTestContent(
        allTestResults.map(testResult => testResult.test),
        newTestPlanVersion.tests
    ));

    // eslint-disable-next-line no-unused-vars
    copyableTestResults = allTestResults.filter(
        testResult => currentTestIdsToNewTestIds[testResult.test.id]
    );
    // [SECTION END]: Preparing data to be worked with in a similar way to TestPlanUpdaterModal

    // TODO: If no input.testPlanVersionId, infer it by whatever the latest is for this directory
    const [foundOrCreatedTestPlanReport, createdLocationsOfData] =
        await getOrCreateTestPlanReport(input);

    const candidatePhaseReachedAt =
        currentTestPlanReport.candidatePhaseReachedAt;
    const recommendedPhaseReachedAt =
        currentTestPlanReport.recommendedPhaseReachedAt;
    const recommendedPhaseTargetDate =
        currentTestPlanReport.recommendedPhaseTargetDate;
    const vendorReviewStatus = currentTestPlanReport.vendorReviewStatus;

    await updateTestPlanReport(foundOrCreatedTestPlanReport.id, {
        candidatePhaseReachedAt,
        recommendedPhaseReachedAt,
        recommendedPhaseTargetDate,
        vendorReviewStatus
    });

    const locationOfData = {
        testPlanReportId: foundOrCreatedTestPlanReport.id
    };
    const preloaded = { testPlanReport: foundOrCreatedTestPlanReport };

    const created = await Promise.all(
        createdLocationsOfData.map(createdLocationOfData =>
            populateData(createdLocationOfData, { preloaded })
        )
    );
    const reportIsNew = !!created.find(item => item.testPlanReport.id);
    if (!reportIsNew)
        // eslint-disable-next-line no-console
        console.info(
            'A report already exists and continuing will overwrite its data.'
        );

    for (const testPlanRun of runsWithResults) {
        // Create new TestPlanRuns
        const { id: testPlanRunId } = await createTestPlanRun({
            testPlanReportId: foundOrCreatedTestPlanReport.id,
            testerUserId: testPlanRun.tester.id
        });

        for (const testResult of testPlanRun.testResults) {
            const testId = currentTestIdsToNewTestIds[testResult.test.id];
            const atVersionId = testResult.atVersion.id;
            const browserVersionId = testResult.browserVersion.id;
            if (!testId) continue;

            // Create new testResults
            const { testResult: testResultSkeleton } =
                await findOrCreateTestResult(
                    {
                        parentContext: { id: testPlanRunId }
                    },
                    { testId, atVersionId, browserVersionId },
                    { ...context, user }
                );

            const copiedTestResultInput = copyTestResult(
                testResultSkeleton,
                testResult
            );

            let savedData;
            if (testResult.completedAt) {
                savedData = await submitTestResult(
                    { parentContext: { id: copiedTestResultInput.id } },
                    { input: copiedTestResultInput },
                    { ...context, user }
                );
            } else {
                savedData = await saveTestResult(
                    { parentContext: { id: copiedTestResultInput.id } },
                    { input: copiedTestResultInput },
                    { ...context, user }
                );
            }
            if (savedData.errors)
                console.error('savedData.errors', savedData.errors);
        }
    }

    // TODO: Delete the old TestPlanReport?
    // await removeTestPlanRunByQuery({ testPlanReportId });
    // await removeTestPlanReport(testPlanReportId);

    return populateData(locationOfData, { preloaded });
};

module.exports = updateTestPlanReportTestPlanVersionResolver;
