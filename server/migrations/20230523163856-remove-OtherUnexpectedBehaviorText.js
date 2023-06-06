'use strict';
const { updateTestPlanRun } = require('../models/services/TestPlanRunService');
const conflictsResolver = require('../resolvers/TestPlanReport/conflictsResolver');

module.exports = {
    up: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            const resultsQuery = await queryInterface.sequelize.query(
                `SELECT id, "testResults" FROM "TestPlanRun"`,
                {
                    transaction
                }
            );

            const results = resultsQuery[0];
            if (!results) {
                // eslint-disable-next-line no-console
                console.info('The test Results are empty');
                return;
            }
            let testPlanRunId;
            for (let i = 0; i < results.length; i += 1) {
                let needsUpdate = false;
                let updateParams = {};
                testPlanRunId = results[i].id;

                if (!results[i].testResults) {
                    continue;
                }
                if (
                    Array.isArray(results[i].testResults) &&
                    results[i].testResults.length < 1
                ) {
                    continue;
                }

                for (let j = 0; j < results[i].testResults.length; j += 1) {
                    // eslint-disable-next-line no-console
                    console.info(
                        `=== Id for TestPlanRun results:${testPlanRunId} ===`
                    );
                    if (!results[i].testResults[j].scenarioResults) {
                        console.log(7);
                        continue;
                    }
                    if (
                        Array.isArray(
                            results[i].testResults[j].scenarioResults
                        ) &&
                        results[i].testResults[j].scenarioResults.length < 1
                    ) {
                        console.log(8);
                        continue;
                    }
                    for (
                        let p = 0;
                        p < results[i].testResults[j].scenarioResults.length;
                        p += 1
                    ) {
                        if (
                            !results[i].testResults[j].scenarioResults[p]
                                .unexpectedBehaviors
                        ) {
                            console.log(9);
                            continue;
                        }

                        if (
                            Array.isArray(
                                results[i].testResults[j].scenarioResults[p]
                                    .unexpectedBehaviors
                            ) &&
                            results[i].testResults[j].scenarioResults[p]
                                .unexpectedBehaviors.length < 1
                        ) {
                            console.log(10);
                            continue;
                        }
                        console.time('Line 110');
                        for (
                            let s = 0;
                            s <
                            results[i].testResults[j].scenarioResults[p]
                                .unexpectedBehaviors.length;
                            s += 1
                        ) {
                            // if (results[i].id === 440 && results[i].testResults[j].id === "MzZiMeyIxMiI6NDQwfQTNkND") {
                            //   console.log("FOUND");
                            // }
                            console.log(11);
                            const unexpectedBehavior =
                                results[i].testResults[j].scenarioResults[p]
                                    .unexpectedBehaviors[s];
                            if (
                                unexpectedBehavior.id !== 'OTHER' &&
                                unexpectedBehavior.otherUnexpectedBehaviorText ===
                                    null
                            ) {
                                console.log(12);
                                delete unexpectedBehavior.otherUnexpectedBehaviorText;
                                console.log(13);
                            }
                            results[i].testResults[j].scenarioResults[
                                p
                            ].unexpectedBehaviors[s] = unexpectedBehavior;
                            needsUpdate = true;
                        }
                        console.timeEnd('Line 110');
                    }
                    updateParams = {
                        testResults: results[i].testResults
                    };
                    // console.log("PARAMS", JSON.stringify(updateParams, null, 2));
                    // console.log("PARAMS", updateParams, JSON.stringify(updateParams?.testResults?.scenarioResults, updateParams?.testResults?.scenarioResults, null, 2));
                    if (needsUpdate)
                        await updateTestPlanRun(testPlanRunId, updateParams);
                }
            }
        });
    }
};
