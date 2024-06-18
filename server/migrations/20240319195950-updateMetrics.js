'use strict';

const { getMetrics } = require('shared');
const populateData = require('../services/PopulatedData/populateData');
const runnableTestsResolver = require('../resolvers/TestPlanReport/runnableTestsResolver');
const finalizedTestResultsResolver = require('../resolvers/TestPlanReport/finalizedTestResultsResolver');
const {
  updateTestPlanReportById
} = require('../models/services/TestPlanReportService');
const getGraphQLContext = require('../graphql-context');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      const context = getGraphQLContext({ req: { transaction } });

      const testPlanReports = await queryInterface.sequelize.query(
        `SELECT id, metrics FROM "TestPlanReport"`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      for (const testPlanReport of testPlanReports) {
        const { testPlanReport: testPlanReportPopulated } = await populateData(
          { testPlanReportId: testPlanReport.id },
          { context }
        );
        const runnableTests = runnableTestsResolver(
          testPlanReportPopulated,
          null,
          context
        );
        const finalizedTestResults = await finalizedTestResultsResolver(
          testPlanReportPopulated,
          null,
          context
        );
        const metrics = getMetrics({
          testPlanReport: {
            ...testPlanReportPopulated,
            finalizedTestResults,
            runnableTests
          }
        });
        await updateTestPlanReportById({
          id: testPlanReportPopulated.id,
          values: {
            metrics: {
              ...testPlanReportPopulated.metrics,
              ...metrics
            }
          },
          transaction
        });
      }
    });
  }
};
