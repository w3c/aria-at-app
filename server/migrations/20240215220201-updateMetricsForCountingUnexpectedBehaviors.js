'use strict';

const getMetrics = require('../util/getMetrics');
const populateData = require('../services/PopulatedData/populateData');
const runnableTestsResolver = require('../resolvers/TestPlanReport/runnableTestsResolver');
const finalizedTestResultsResolver = require('../resolvers/TestPlanReport/finalizedTestResultsResolver');
const {
    updateTestPlanReport
} = require('../models/services/TestPlanReportService');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            const testPlanReports = await queryInterface.sequelize.query(
                `SELECT id, metrics FROM "TestPlanReport"`,
                {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            for (const testPlanReport of testPlanReports) {
                const { testPlanReport: testPlanReportPopulated } =
                    await populateData({ testPlanReportId: testPlanReport.id });
                const runnableTests = runnableTestsResolver(
                    testPlanReportPopulated
                );
                const finalizedTestResults = await finalizedTestResultsResolver(
                    testPlanReportPopulated
                );
                const metrics = getMetrics({
                    testPlanReport: {
                        ...testPlanReportPopulated,
                        finalizedTestResults,
                        runnableTests
                    }
                });
                await updateTestPlanReport(testPlanReportPopulated.id, {
                    metrics: { ...testPlanReportPopulated.metrics, ...metrics }
                });
            }
        });
    }
};
