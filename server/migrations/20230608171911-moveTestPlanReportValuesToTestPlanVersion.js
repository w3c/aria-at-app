'use strict';

const BrowserLoader = require('../models/loaders/BrowserLoader');
const AtLoader = require('../models/loaders/AtLoader');
const { TEST_PLAN_REPORT_ATTRIBUTES } = require('../models/services/helpers');
const scenariosResolver = require('../resolvers/Test/scenariosResolver');
const {
    getTestPlanReportById,
    getOrCreateTestPlanReport,
    updateTestPlanReport
} = require('../models/services/TestPlanReportService');
const populateData = require('../services/PopulatedData/populateData');
const { testResults } = require('../resolvers/TestPlanRun');
const {
    createTestPlanRun,
    getTestPlanRunById
} = require('../models/services/TestPlanRunService');
const {
    findOrCreateTestResult
} = require('../resolvers/TestPlanRunOperations');
const {
    submitTestResult,
    saveTestResult
} = require('../resolvers/TestResultOperations');
const { hashTests } = require('../util/aria');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const atLoader = AtLoader();
        const browserLoader = BrowserLoader();

        const compareTestContent = (currentTests, newTests) => {
            const currentTestsByHash = hashTests(currentTests);
            const newTestsByHash = hashTests(newTests);

            const testsToDelete = [];
            const currentTestIdsToNewTestIds = {};
            Object.entries(currentTestsByHash).forEach(
                ([hash, currentTest]) => {
                    const newTest = newTestsByHash[hash];
                    if (!newTest) {
                        testsToDelete.push(currentTest);
                        return;
                    }
                    currentTestIdsToNewTestIds[currentTest.id] = newTest.id;
                }
            );

            return { testsToDelete, currentTestIdsToNewTestIds };
        };

        const copyTestResult = (testResultSkeleton, testResult) => {
            return {
                id: testResultSkeleton.id,
                atVersionId: testResultSkeleton.atVersion.id,
                browserVersionId: testResultSkeleton.browserVersion.id,
                scenarioResults: testResultSkeleton.scenarioResults.map(
                    (scenarioResultSkeleton, index) => {
                        const scenarioResult =
                            testResult.scenarioResults[index];
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
                            unexpectedBehaviors:
                                scenarioResult.unexpectedBehaviors
                        };
                    }
                )
            };
        };

        return queryInterface.sequelize.transaction(async transaction => {
            const testPlanReportsQuery = await queryInterface.sequelize.query(
                `select "TestPlanReport".id  as "testPlanReportId",
                            "TestPlanVersion".id as "testPlanVersionId",
                            directory,
                            status,
                            "testPlanVersionId",
                            "atId",
                            "browserId",
                            "updatedAt"          as "gitShaDate",
                            "TestPlanReport"."candidateStatusReachedAt",
                            "TestPlanReport"."recommendedStatusReachedAt",
                            "TestPlanReport"."recommendedStatusTargetDate"
                     from "TestPlanReport"
                              join "TestPlanVersion" on "TestPlanReport"."testPlanVersionId" = "TestPlanVersion".id
                     where status in ('CANDIDATE', 'RECOMMENDED')
                     order by title, "gitShaDate" desc`,
                {
                    transaction
                }
            );
            const testPlanReportsData = testPlanReportsQuery[0];

            const testPlanReportLatestReleasedQuery =
                async testPlanReportId => {
                    return await queryInterface.sequelize.query(
                        `select "atVersionId", name, "releasedAt", "testPlanReportId", "testerUserId", "testPlanRunId"
                            from ( select distinct "TestPlanReport".id                                              as "testPlanReportId",
                                                   "TestPlanRun".id                                                 as "testPlanRunId",
                                                   "TestPlanRun"."testerUserId",
                                                   (jsonb_array_elements("testResults") ->> 'atVersionId')::integer as "atVersionId"
                                   from "TestPlanReport"
                                            left outer join "TestPlanRun" on "TestPlanRun"."testPlanReportId" = "TestPlanReport".id
                                   where "testPlanReportId" = ${testPlanReportId}
                                   group by "TestPlanReport".id, "TestPlanRun".id ) as atVersionResults
                                     join "AtVersion" on "AtVersion".id = atVersionResults."atVersionId"
                            order by "releasedAt" desc
                            limit 1;`,
                        { transaction }
                    );
                };

            const testPlanReportsByDirectory = {};
            for (let i = 0; i < testPlanReportsData.length; i++) {
                let testPlanReport = testPlanReportsData[i];
                const testPlanReportLatestReleasedData = (
                    await testPlanReportLatestReleasedQuery(
                        testPlanReport.testPlanReportId
                    )
                )[0];
                testPlanReport.latestAtVersionReleasedAt =
                    testPlanReportLatestReleasedData[0].releasedAt;

                if (!testPlanReportsByDirectory[testPlanReport.directory])
                    testPlanReportsByDirectory[testPlanReport.directory] = [
                        testPlanReport
                    ];
                else
                    testPlanReportsByDirectory[testPlanReport.directory].push(
                        testPlanReport
                    );
            }

            // We now need to rely on a single TestPlanVersion now, rather than having consolidated
            // TestPlanReports, we need to do the following:

            // Determine which TestPlanReport is the latest TestPlanVersion for a report group
            // AND determine which TestPlanReports need to be updated to that latest version
            // (without losing data, but there may need to be some manual updates that will have to
            // happen)

            const findHighestTestPlanVersion = testPlanReportsByDirectory => {
                const result = {};

                for (const directory in testPlanReportsByDirectory) {
                    const reports = testPlanReportsByDirectory[directory];

                    let highestTestPlanVersion = 0;
                    let highestCollectiveStatus = 'RECOMMENDED';
                    let latestAtVersionReleasedAtOverall = '';
                    let latestCandidateStatusReachedAt = '';
                    let latestRecommendedStatusReachedAt = '';
                    let latestRecommendedStatusTargetDate = '';
                    let latestAtBrowserMatchings = {};

                    for (const report of reports) {
                        const {
                            testPlanVersionId,
                            status,
                            atId,
                            browserId,
                            latestAtVersionReleasedAt,
                            candidateStatusReachedAt,
                            recommendedStatusReachedAt,
                            recommendedStatusTargetDate
                        } = report;

                        // Determine which of the AT+Browser pairs should be updated (these are
                        // what's being currently displayed on the reports page for each column)
                        const uniqueAtBrowserKey = `${atId}-${browserId}`;
                        if (
                            !latestAtBrowserMatchings[uniqueAtBrowserKey] ||
                            latestAtVersionReleasedAt >
                                latestAtBrowserMatchings[uniqueAtBrowserKey]
                                    .latestAtVersionReleasedAt
                        ) {
                            latestAtBrowserMatchings[uniqueAtBrowserKey] =
                                report;

                            if (status === 'CANDIDATE')
                                highestCollectiveStatus = 'CANDIDATE';
                        }

                        if (
                            testPlanVersionId > highestTestPlanVersion ||
                            (testPlanVersionId === highestTestPlanVersion &&
                                latestAtVersionReleasedAt >
                                    latestAtVersionReleasedAtOverall)
                        ) {
                            highestTestPlanVersion = testPlanVersionId;
                            latestAtVersionReleasedAtOverall =
                                latestAtVersionReleasedAt;
                            latestCandidateStatusReachedAt =
                                candidateStatusReachedAt;
                            latestRecommendedStatusReachedAt =
                                recommendedStatusReachedAt;
                            latestRecommendedStatusTargetDate =
                                recommendedStatusTargetDate;
                        }
                    }

                    result[directory] = {
                        directory,
                        highestTestPlanVersion,
                        highestCollectiveStatus,
                        latestAtVersionReleasedAtOverall,
                        latestCandidateStatusReachedAt,
                        latestRecommendedStatusReachedAt,
                        latestRecommendedStatusTargetDate,
                        latestAtBrowserMatchings
                    };
                }

                return result;
            };

            // Find the latest testPlanVersion for each directory
            const highestVersions = findHighestTestPlanVersion(
                testPlanReportsByDirectory
            );

            const updateTestPlanReportTestPlanVersion = async ({
                atId,
                browserId,
                testPlanReportId,
                newTestPlanVersionId,
                testPlanReportAttributes
            }) => {
                const context = {
                    atLoader,
                    browserLoader,
                    user: {
                        roles: [{ name: 'ADMIN' }]
                    }
                };

                // [SECTION START]: Preparing data to be worked with in a similar way to TestPlanUpdaterModal
                const newTestPlanVersionQuery =
                    await queryInterface.sequelize.query(
                        `SELECT
                             *
                         FROM "TestPlanVersion"
                         WHERE id = ?;`,
                        {
                            replacements: [newTestPlanVersionId],
                            type: Sequelize.QueryTypes.SELECT,
                            transaction
                        }
                    );

                const newTestPlanVersionData = newTestPlanVersionQuery[0];
                const newTestPlanVersion = {
                    id: newTestPlanVersionData.id,
                    tests: newTestPlanVersionData.tests.map(
                        ({
                            assertions,
                            atMode,
                            atIds,
                            id,
                            scenarios,
                            title
                        }) => {
                            return {
                                id,
                                title,
                                ats: atIds.map(atId => ({
                                    id: atId
                                })),
                                atMode,
                                scenarios: scenariosResolver(
                                    { scenarios },
                                    { atId }
                                ).map(({ commandIds }) => {
                                    return {
                                        commands: commandIds.map(commandId => ({
                                            text: commandId
                                        }))
                                    };
                                }),
                                assertions: assertions.map(
                                    ({ priority, text }) => ({
                                        priority,
                                        text
                                    })
                                )
                            };
                        }
                    )
                };

                const currentTestPlanReport = await getTestPlanReportById(
                    testPlanReportId,
                    testPlanReportAttributes
                );

                for (
                    let i = 0;
                    i < currentTestPlanReport.testPlanRuns.length;
                    i++
                ) {
                    const testPlanRunId =
                        currentTestPlanReport.testPlanRuns[i].id;
                    const testPlanRun = await getTestPlanRunById(
                        testPlanRunId,
                        null,
                        null,
                        testPlanReportAttributes
                    );
                    // testPlanReport = testPlanRun?.testPlanReport;

                    testPlanRun.testResults = await testResults(
                        testPlanRun,
                        null,
                        context
                    );

                    if (!currentTestPlanReport.draftTestPlanRuns)
                        currentTestPlanReport.draftTestPlanRuns = [];
                    currentTestPlanReport.draftTestPlanRuns[i] = testPlanRun;
                }

                const skeletonTestPlanReport = {
                    id: currentTestPlanReport.id,
                    draftTestPlanRuns:
                        currentTestPlanReport.draftTestPlanRuns.map(
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
                                                    {
                                                        scenarios:
                                                            test.scenarios
                                                    },
                                                    { atId }
                                                ).map(({ commandIds }) => {
                                                    return {
                                                        commands:
                                                            commandIds.map(
                                                                commandId => ({
                                                                    text: commandId
                                                                })
                                                            )
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
                                            browserVersion: {
                                                id: browserVersion.id
                                            },
                                            completedAt,
                                            scenarioResults:
                                                scenarioResults.map(
                                                    ({
                                                        output,
                                                        assertionResults,
                                                        unexpectedBehaviors
                                                    }) => ({
                                                        output,
                                                        assertionResults:
                                                            assertionResults.map(
                                                                ({
                                                                    failedReason,
                                                                    passed
                                                                }) => ({
                                                                    passed,
                                                                    failedReason
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

                runsWithResults =
                    skeletonTestPlanReport.draftTestPlanRuns.filter(
                        testPlanRun => testPlanRun.testResults.length
                    );

                allTestResults = runsWithResults.flatMap(
                    testPlanRun => testPlanRun.testResults
                );

                // eslint-disable-next-line no-unused-vars
                ({ testsToDelete, currentTestIdsToNewTestIds } =
                    compareTestContent(
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
                    await getOrCreateTestPlanReport(
                        {
                            testPlanVersionId: newTestPlanVersionId,
                            atId,
                            browserId
                        },
                        testPlanReportAttributes
                    );

                const candidatePhaseReachedAt =
                    currentTestPlanReport.candidatePhaseReachedAt;
                const recommendedPhaseReachedAt =
                    currentTestPlanReport.recommendedPhaseReachedAt;
                const recommendedPhaseTargetDate =
                    currentTestPlanReport.recommendedPhaseTargetDate;
                const vendorReviewStatus =
                    currentTestPlanReport.vendorReviewStatus;

                await updateTestPlanReport(
                    foundOrCreatedTestPlanReport.id,
                    {
                        candidatePhaseReachedAt,
                        recommendedPhaseReachedAt,
                        recommendedPhaseTargetDate,
                        vendorReviewStatus
                    },
                    testPlanReportAttributes
                );

                // const locationOfData = {
                //     testPlanReportId: foundOrCreatedTestPlanReport.id
                // };
                const preloaded = {
                    testPlanReport: foundOrCreatedTestPlanReport
                };

                const created = await Promise.all(
                    createdLocationsOfData.map(createdLocationOfData =>
                        populateData(createdLocationOfData, {
                            preloaded
                        })
                    )
                );
                const reportIsNew = !!created.find(
                    item => item.testPlanReport.id
                );
                if (!reportIsNew)
                    // eslint-disable-next-line no-console
                    console.info(
                        'A report already exists and continuing will overwrite its data.'
                    );

                for (const testPlanRun of runsWithResults) {
                    // Create new TestPlanRuns
                    const { id: testPlanRunId } = await createTestPlanRun(
                        {
                            testPlanReportId: foundOrCreatedTestPlanReport.id,
                            testerUserId: testPlanRun.tester.id
                        },
                        null,
                        null,
                        testPlanReportAttributes
                    );

                    for (const testResult of testPlanRun.testResults) {
                        const testId =
                            currentTestIdsToNewTestIds[testResult.test.id];
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
                                context
                            );

                        const copiedTestResultInput = copyTestResult(
                            testResultSkeleton,
                            testResult
                        );

                        let savedData;
                        if (testResult.completedAt) {
                            savedData = await submitTestResult(
                                {
                                    parentContext: {
                                        id: copiedTestResultInput.id
                                    }
                                },
                                { input: copiedTestResultInput },
                                context
                            );
                        } else {
                            savedData = await saveTestResult(
                                {
                                    parentContext: {
                                        id: copiedTestResultInput.id
                                    }
                                },
                                { input: copiedTestResultInput },
                                context
                            );
                        }
                        if (savedData.errors)
                            console.error('savedData.errors', savedData.errors);
                    }
                }

                // TODO: Delete the old TestPlanReport?
                // await removeTestPlanRunByQuery({ testPlanReportId });
                // await removeTestPlanReport(testPlanReportId);
                // return populateData(locationOfData, { preloaded, context });
            };

            for (let i = 0; i < Object.values(highestVersions).length; i++) {
                const highestTestPlanVersion =
                    Object.values(highestVersions)[i];

                // Update the noted test plan versions to use the dates of the currently defined
                // "latest" test plan reports' phases
                const {
                    highestTestPlanVersion: highestTestPlanVersionId,
                    highestCollectiveStatus: phase,
                    latestCandidateStatusReachedAt: candidatePhaseReachedAt,
                    latestRecommendedStatusReachedAt: recommendedPhaseReachedAt,
                    latestRecommendedStatusTargetDate:
                        recommendedPhaseTargetDate,
                    latestAtBrowserMatchings
                } = highestTestPlanVersion;

                await queryInterface.sequelize.query(
                    `UPDATE "TestPlanVersion"
                             SET phase                        = ?,
                                 "candidatePhaseReachedAt"    = ?,
                                 "recommendedPhaseReachedAt"  = ?,
                                 "recommendedPhaseTargetDate" = ?
                             WHERE id = ?`,
                    {
                        replacements: [
                            phase,
                            candidatePhaseReachedAt,
                            recommendedPhaseReachedAt,
                            recommendedPhaseTargetDate,
                            highestTestPlanVersionId
                        ],
                        transaction
                    }
                );

                // Update the individual reports, so they can be included as part of the same phase
                // by being a part of the same test plan version
                for (const uniqueMatchKey in latestAtBrowserMatchings) {
                    const uniqueMatch =
                        latestAtBrowserMatchings[uniqueMatchKey];
                    if (
                        uniqueMatch.testPlanVersionId !==
                        highestTestPlanVersionId
                    ) {
                        // eslint-disable-next-line no-console
                        console.info(
                            `=== Updating testPlanReportId ${uniqueMatch.testPlanReportId} to testPlanVersionId ${highestTestPlanVersionId} for atId ${uniqueMatch.atId} and browserId ${uniqueMatch.browserId} ===`
                        );
                        await updateTestPlanReportTestPlanVersion({
                            atId: uniqueMatch.atId,
                            browserId: uniqueMatch.browserId,
                            testPlanReportId: uniqueMatch.testPlanReportId,
                            newTestPlanVersionId: highestTestPlanVersionId,
                            testPlanReportAttributes:
                                TEST_PLAN_REPORT_ATTRIBUTES.filter(
                                    e => !['markedFinalAt'].includes(e)
                                )
                        });
                    }
                }
            }
        });
    }
};
