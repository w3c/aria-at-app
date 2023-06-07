'use strict';

const populateData = require('../services/PopulatedData/populateData');
const { updateTestPlanRun } = require('../models/services/TestPlanRunService');
const {
    updateTestPlanReport
} = require('../models/services/TestPlanReportService');
const conflictsResolver = require('../resolvers/TestPlanReport/conflictsResolver');

module.exports = {
    up: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            const testPlanRunQuery = await queryInterface.sequelize.query(
                `SELECT id, "testResults" FROM "TestPlanRun"`,
                {
                    transaction
                }
            );

            const testPlanReportQuery = await queryInterface.sequelize.query(
                `SELECT id FROM "TestPlanReport"`,
                {
                    transaction
                }
            );

            // console.log("RIGHT HERE", testPlanReportQuery)

            const testPlanRunData = testPlanRunQuery[0];
            const testPlanReportsData = testPlanReportQuery[0];
            if (!testPlanRunData) {
                // eslint-disable-next-line no-console
                console.info('The test Results are empty');
                return;
            }

            for (let i = 0; i < testPlanRunData.length; i += 1) {
                const testPlanRun = testPlanRunData[i];
                const testPlanRunId = testPlanRun.id;
                let needsUpdate = false;

                let updateParams = {
                    testResults: testPlanRun.testResults
                };

                // eslint-disable-next-line no-console
                console.info(
                    `=== Id for TestPlanRun results:${testPlanRunId} ===`
                );

                if (!testPlanRunData[i].testResults) {
                    continue;
                }
                if (
                    Array.isArray(testPlanRunData[i].testResults) &&
                    testPlanRunData[i].testResults.length < 1
                ) {
                    continue;
                }

                for (
                    let j = 0;
                    j < testPlanRunData[i].testResults.length;
                    j += 1
                ) {
                    if (!testPlanRunData[i].testResults[j].scenarioResults) {
                        console.log(7);
                        continue;
                    }
                    if (
                        Array.isArray(
                            testPlanRunData[i].testResults[j].scenarioResults
                        ) &&
                        testPlanRunData[i].testResults[j].scenarioResults
                            .length < 1
                    ) {
                        console.log(8);
                        continue;
                    }
                    for (
                        let p = 0;
                        p <
                        testPlanRunData[i].testResults[j].scenarioResults
                            .length;
                        p += 1
                    ) {
                        if (
                            !testPlanRunData[i].testResults[j].scenarioResults[
                                p
                            ].unexpectedBehaviors
                        ) {
                            console.log(9);
                            continue;
                        }

                        if (
                            Array.isArray(
                                testPlanRunData[i].testResults[j]
                                    .scenarioResults[p].unexpectedBehaviors
                            ) &&
                            testPlanRunData[i].testResults[j].scenarioResults[p]
                                .unexpectedBehaviors.length < 1
                        ) {
                            console.log(10);
                            continue;
                        }
                        for (
                            let s = 0;
                            s <
                            testPlanRunData[i].testResults[j].scenarioResults[p]
                                .unexpectedBehaviors.length;
                            s += 1
                        ) {
                            // if (results[i].id === 440 && results[i].testResults[j].id === "MzZiMeyIxMiI6NDQwfQTNkND") {
                            //   console.log("FOUND");
                            // }
                            console.log(11);
                            const unexpectedBehavior =
                                testPlanRunData[i].testResults[j]
                                    .scenarioResults[p].unexpectedBehaviors[s];
                            if (
                                unexpectedBehavior.id !== 'OTHER' &&
                                unexpectedBehavior.otherUnexpectedBehaviorText ===
                                    null
                            ) {
                                console.log(12);
                                delete unexpectedBehavior.otherUnexpectedBehaviorText;
                                console.log(13);

                                updateParams.testResults[j] =
                                    testPlanRunData[i].testResults[j];

                                needsUpdate = true;
                            }
                        }
                    }
                    // updateParams = {
                    //     testResults: testPlanRunData[i].testResults
                    // };
                    // console.log("PARAMS", JSON.stringify(updateParams, null, 2));
                    // console.log("PARAMS", updateParams, JSON.stringify(updateParams?.testResults?.scenarioResults, updateParams?.testResults?.scenarioResults, null, 2));
                }

                if (needsUpdate)
                    await updateTestPlanRun(testPlanRunId, updateParams);
            }

            // const testPlanReportsData = testPlanReportQuery[0];

            for (let i = 0; i < testPlanReportsData.length; i++) {
                const testPlanReportId = testPlanReportsData[i].id;
              
                console.log("Test1");
                console.log(testPlanReportId);
                console.log("Test2");
                // const status = testPlanReportsData[i].status;

                // eslint-disable-next-line no-console
                // console.info(
                //     `=== Calculating metrics for TestPlanReport:${testPlanReportId} ===`
                // );
               
                let updateParams = {};
                const { testPlanReport } = await populateData({
                    testPlanReportId
                });
                const conflicts = await conflictsResolver(testPlanReport);
                updateParams = {
                    metrics: {
                        conflictsCount: conflicts.length
                    }
                };

                // if (status === 'IN_REVIEW' || status === 'FINALIZED') {
                //     const finalizedTestResults =
                //         finalizedTestResultsResolver({
                //             ...testPlanReport,
                //             status
                //         }) || [];
                //     if (finalizedTestResults.length) {
                //         const runnableTests =
                //             runnableTestsResolver(testPlanReport);
                //         const metrics = getMetrics({
                //             testPlanReport: {
                //                 ...testPlanReport,
                //                 finalizedTestResults,
                //                 runnableTests
                //             }
                //         });
                //         updateParams = {
                //             metrics: { ...updateParams.metrics, ...metrics }
                //         };
                //     }
                // }

                await updateTestPlanReport(testPlanReport.id, updateParams);
            }
        });
    }
};
