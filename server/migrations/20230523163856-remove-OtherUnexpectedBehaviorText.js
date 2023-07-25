'use strict';
const { updateTestPlanRun } = require('../models/services/TestPlanRunService');
const {
    updateTestPlanReport,
    getTestPlanReportById
} = require('../models/services/TestPlanReportService');
const conflictsResolver = require('../resolvers/TestPlanReport/conflictsResolver');
const BrowserLoader = require('../models/loaders/BrowserLoader');
const AtLoader = require('../models/loaders/AtLoader');

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
                `SELECT id, status FROM "TestPlanReport"`,
                {
                    transaction
                }
            );

            const atLoader = AtLoader();
            const browserLoader = BrowserLoader();
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
                        continue;
                    }
                    if (
                        Array.isArray(
                            testPlanRunData[i].testResults[j].scenarioResults
                        ) &&
                        testPlanRunData[i].testResults[j].scenarioResults
                            .length < 1
                    ) {
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
                            continue;
                        }
                        for (
                            let s = 0;
                            s <
                            testPlanRunData[i].testResults[j].scenarioResults[p]
                                .unexpectedBehaviors.length;
                            s += 1
                        ) {
                            const unexpectedBehavior =
                                testPlanRunData[i].testResults[j]
                                    .scenarioResults[p].unexpectedBehaviors[s];
                            if (
                                unexpectedBehavior.id !== 'OTHER' &&
                                unexpectedBehavior.otherUnexpectedBehaviorText ===
                                    null
                            ) {
                                delete unexpectedBehavior.otherUnexpectedBehaviorText;

                                updateParams.testResults[j] =
                                    testPlanRunData[i].testResults[j];

                                needsUpdate = true;
                            }
                        }
                    }
                }

                if (needsUpdate) {
                    // eslint-disable-next-line no-console
                    console.info(
                        `=== Fixing unexpectedBehavior results for TestPlanRun:${testPlanRunId} ===`
                    );
                    await updateTestPlanRun(
                        testPlanRunId,
                        updateParams,
                        null,
                        [],
                        [],
                        []
                    );
                }
            }

            for (let i = 0; i < testPlanReportsData.length; i++) {
                const testPlanReportId = testPlanReportsData[i].id;
                const status = testPlanReportsData[i].status;
                if (status === 'DRAFT') {
                    let updateParams = {};
                    const testPlanReport = await getTestPlanReportById(
                        testPlanReportId,
                        null,
                        null,
                        ['id', 'tests']
                    );

                    const conflicts = await conflictsResolver(
                        testPlanReport,
                        null,
                        { atLoader, browserLoader }
                    );

                    updateParams = {
                        metrics: {
                            conflictsCount: conflicts.length
                        }
                    };

                    await updateTestPlanReport(
                        testPlanReport.id,
                        updateParams,
                        [],
                        [],
                        []
                    );
                }
            }
        });
    }
};
