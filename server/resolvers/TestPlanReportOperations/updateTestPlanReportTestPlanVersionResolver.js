const hash = require('object-hash');
const { omit } = require('lodash');
const {
    getTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const {
    getTestPlanVersionById
} = require('../../models/services/TestPlanVersionService');
const { testResults } = require('../TestPlanRun');
const populateData = require('../../services/PopulatedData/populateData');
const scenariosResolver = require('../Test/scenariosResolver');

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

const updateTestPlanReportTestPlanVersionResolver = async (
    { parentContext: { id: testPlanReportId } },
    { input },
    context
) => {
    // const { user } = context;
    // if (!user?.roles.find(role => role.name === 'ADMIN')) {
    //     throw new AuthenticationError();
    // }

    const { testPlanVersionId: newTestPlanVersionId, atId, browserId } = input;

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
    // console.log('newTestPlanVersion', newTestPlanVersion);
    // console.log(
    //     'newTestPlanVersion:checkAts',
    //     JSON.stringify(newTestPlanVersion.tests[0].ats, null, 2)
    // );
    // console.log(
    //     'newTestPlanVersion:checkAssertions',
    //     JSON.stringify(newTestPlanVersion.tests[0].assertions, null, 2)
    // );
    // console.log(
    //     'newTestPlanVersion:checkCommands',
    //     JSON.stringify(newTestPlanVersion.tests[0].scenarios, null, 2)
    // );

    const currentTestPlanReport = (
        await getTestPlanReportById(testPlanReportId)
    ).toJSON();

    for (let i = 0; i < currentTestPlanReport.testPlanRuns.length; i++) {
        const testPlanRun = currentTestPlanReport.testPlanRuns[i];
        const { testPlanRun: populatedTestPlanRun } = await populateData(
            { testPlanRunId: testPlanRun.id },
            { context }
        );

        testPlanRun.testResults = await testResults(
            populatedTestPlanRun.toJSON(),
            null,
            context
        );

        if (!currentTestPlanReport.draftTestPlanRuns)
            currentTestPlanReport.draftTestPlanRuns = [];
        currentTestPlanReport.draftTestPlanRuns[i] = testPlanRun;
    }
    // console.log('currentTestPlanReport', currentTestPlanReport);

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
                                atMode: test.atMode,
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
                                        ({ failedReason, passed }) => ({
                                            passed,
                                            failedReason
                                        })
                                    ),
                                    unexpectedBehaviors:
                                        unexpectedBehaviors.map(
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
    // console.log('skeletonTestPlanReport', skeletonTestPlanReport);

    let runsWithResults,
        allTestResults,
        copyableTestResults,
        testsToDelete,
        currentTestIdsToNewTestIds;

    runsWithResults = skeletonTestPlanReport.draftTestPlanRuns.filter(
        testPlanRun => testPlanRun.testResults.length
    );
    // console.log('runsWithResults', runsWithResults);
    // console.log('runsWithResults:testResult', runsWithResults[0].testResults);

    allTestResults = runsWithResults.flatMap(
        testPlanRun => testPlanRun.testResults
    );
    // console.log('allTestResults', allTestResults);

    ({ testsToDelete, currentTestIdsToNewTestIds } = compareTestContent(
        allTestResults.map(testResult => testResult.test),
        newTestPlanVersion.tests
    ));
    console.log('testsToDelete', testsToDelete);
    console.log('currentTestIdsToNewTestIds', currentTestIdsToNewTestIds);

    copyableTestResults = allTestResults.filter(
        testResult => currentTestIdsToNewTestIds[testResult.test.id]
    );
    console.log('copyableTestResults', copyableTestResults);
    // [SECTION END]: Preparing data to be worked with in a similar way to TestPlanUpdaterModal

    /*const copyTestResult = (testResultSkeleton, testResult) => {
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
                                (
                                    assertionResultSkeleton,
                                    assertionResultIndex
                                ) => {
                                    const assertionResult =
                                        scenarioResult.assertionResults[
                                            assertionResultIndex
                                        ];
                                    return {
                                        id: assertionResultSkeleton.id,
                                        passed: assertionResult.passed,
                                        failedReason:
                                            assertionResult.failedReason
                                    };
                                }
                            ),
                        unexpectedBehaviors: scenarioResult.unexpectedBehaviors
                    };
                }
            )
        };
    };

    const compareTestContent = (currentTests, newTests) => {
        const hashTest = test => hash(omit(test, ['id']));
        const hashTests = tests => {
            return Object.fromEntries(
                tests.map(test => [hashTest(test), test])
            );
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

    let testsToDelete;
    let currentTestIdsToNewTestIds;

    const { testPlanReport } = await populateData(
        { testPlanReportId },
        { context }
    );

    // TODO: If no input.testPlanVersionId, infer it by whatever the latest is for this directory
    const [foundOrCreatedTestPlanReport, createdLocationsOfData] =
        await getOrCreateTestPlanReport(input, {
            // TODO: Pass a boolean on taking the current testPlanReport's status or use DRAFT
            status: testPlanReport.status
        });

    const locationOfData = {
        testPlanReportId: foundOrCreatedTestPlanReport.id
    };
    const preloaded = { testPlanReport: foundOrCreatedTestPlanReport };

    const created = await Promise.all(
        createdLocationsOfData.map(createdLocationOfData =>
            populateData(createdLocationOfData, { preloaded, context })
        )
    );
    const reportIsNew = !!created.find(item => item.testPlanReport.id);
    if (reportIsNew)
        console.error(
            'A report already exists and continuing would overwrite its data.'
        );

    const testPlanRuns = draftTestPlanRuns(testPlanReport);
    const runsWithResults = testPlanRuns.filter(
        testPlanRun => testPlanRun.testResults.length
    );

    let allTestResults = runsWithResults.flatMap(
        testPlanRun => testPlanRun.testResults
    );

    ({ testsToDelete, currentTestIdsToNewTestIds } = compareTestContent(
        allTestResults.map(testResult => testResult.test),
        foundOrCreatedTestPlanReport.tests
    ));

    let copyableTestResults = allTestResults.filter(
        testResult => currentTestIdsToNewTestIds[testResult.test.id]
    );

    for (const testPlanRun of runsWithResults) {
        const { id: testPlanRunId } = await createTestPlanRun({
            testPlanReportId,
            testerUserId: testPlanRun.tester.id
        });

        console.log('check.testPlanRunId', testPlanRunId);

        for (const testResult of testPlanRun.testResults) {
            const testId = currentTestIdsToNewTestIds[testResult.test.id];
            const atVersionId = testResult.atVersion.id;
            const browserVersionId = testResult.browserVersion.id;
            if (!testId) continue;

            const { data: testResultData } = await client.mutate({
                mutation: CREATE_TEST_RESULT_MUTATION,
                variables: {
                    testPlanRunId,
                    testId,
                    atVersionId,
                    browserVersionId
                }
            });

            const testResultSkeleton =
                testResultData.testPlanRun.findOrCreateTestResult.testResult;

            const copiedTestResultInput = copyTestResult(
                testResultSkeleton,
                testResult
            );

            const saveMutation = testResult.completedAt
                ? SUBMIT_TEST_RESULT_MUTATION
                : SAVE_TEST_RESULT_MUTATION;

            const { data: savedData } = await client.mutate({
                mutation: saveMutation,
                variables: {
                    testResultId: copiedTestResultInput.id,
                    testResultInput: copiedTestResultInput
                }
            });

            if (savedData.errors) throw savedData.errors;
        }
    }

    console.log('check.testPlanReport', testPlanReport);
    console.log(
        'check.foundOrCreatedTestPlanReport',
        foundOrCreatedTestPlanReport
    );
    console.log('check.created', created);
    console.log('check.runsWithResults', runsWithResults);
    // console.log('check.testsToDelete', testsToDelete);
    // console.log('check.currentTestIdsToNewTestIds', currentTestIdsToNewTestIds);
    // console.log('check.copyableTestResults', copyableTestResults);*/

    // return populateData(locationOfData, { preloaded, context });
};

module.exports = updateTestPlanReportTestPlanVersionResolver;
