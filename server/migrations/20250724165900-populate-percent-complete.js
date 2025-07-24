'use strict';

const {
  calculatePercentComplete
} = require('../util/calculatePercentComplete');
const getGraphQLContext = require('../graphql-context');
const populateData = require('../services/PopulatedData/populateData');
const runnableTestsResolver = require('../resolvers/TestPlanReport/runnableTestsResolver');

const populatePercentComplete = async (queryInterface, transaction) => {
  const testPlanReports = await queryInterface.sequelize.query(
    `SELECT id, "atId" FROM "TestPlanReport"`,
    { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
  );

  const context = getGraphQLContext({ req: { transaction } });

  for (const report of testPlanReports) {
    const testPlanRuns = await queryInterface.sequelize.query(
      `SELECT "testResults" FROM "TestPlanRun" WHERE "testPlanReportId" = :reportId`,
      {
        replacements: { reportId: report.id },
        type: queryInterface.sequelize.QueryTypes.SELECT,
        transaction
      }
    );

    const draftTestPlanRuns = testPlanRuns.map(run => ({
      testResults: run.testResults
    }));

    // Get populated test plan report for runnableTestsResolver
    const { testPlanReport: populatedTestPlanReport } = await populateData(
      { testPlanReportId: report.id },
      { context }
    );

    // Get runnable tests for this AT
    const runnableTests = runnableTestsResolver(
      populatedTestPlanReport,
      null,
      context
    );

    const percentComplete = calculatePercentComplete({
      draftTestPlanRuns,
      runnableTests,
      atId: report.atId
    });

    await queryInterface.sequelize.query(
      `UPDATE "TestPlanReport" SET "percentComplete" = :percentComplete WHERE id = :reportId`,
      {
        replacements: { percentComplete, reportId: report.id },
        transaction
      }
    );
  }
};

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await populatePercentComplete(queryInterface, transaction);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE "TestPlanReport" SET "percentComplete" = NULL`
    );
  }
};
