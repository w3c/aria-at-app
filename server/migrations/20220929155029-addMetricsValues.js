'use strict';

const populateData = require('../services/PopulatedData/populateData');
const conflictsResolver = require('../resolvers/TestPlanReport/conflictsResolver');
const finalizedTestResultsResolver = require('../resolvers/TestPlanReport/finalizedTestResultsResolver');
const runnableTestsResolver = require('../resolvers/TestPlanReport/runnableTestsResolver');
const getMetrics = require('../util/getMetrics');
const {
    updateTestPlanReport
} = require('../models/services/TestPlanReportService');

module.exports = {
    up: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            const testPlanReports = await queryInterface.sequelize.query(
                `SELECT id, status FROM "TestPlanReport"`,
                {
                    transaction
                }
            );
            const testPlanReportsData = testPlanReports[0];

            for (let i = 0; i < testPlanReportsData.length; i++) {
                const testPlanReportId = testPlanReportsData[i].id;
                const status = testPlanReportsData[i].status;

                // eslint-disable-next-line no-console
                console.info(
                    `=== Calculating metrics for TestPlanReport:${testPlanReportId} ===`
                );
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

                if (status === 'IN_REVIEW' || status === 'FINALIZED') {
                    const finalizedTestResults =
                        finalizedTestResultsResolver({
                            ...testPlanReport,
                            status
                        }) || [];
                    if (finalizedTestResults.length) {
                        const runnableTests = runnableTestsResolver(
                            testPlanReport
                        );
                        const metrics = getMetrics({
                            testPlanReport: {
                                ...testPlanReport,
                                finalizedTestResults,
                                runnableTests
                            }
                        });
                        updateParams = {
                            metrics: { ...updateParams.metrics, ...metrics }
                        };
                    }
                }

                await updateTestPlanReport(testPlanReport.id, updateParams);
            }
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.sequelize.query(
                `update "TestPlanReport" set "metrics" = '{}'`,
                {
                    transaction
                }
            );
        });
    }
};
