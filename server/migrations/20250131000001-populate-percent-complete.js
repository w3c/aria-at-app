'use strict';

const {
  calculatePercentComplete
} = require('../util/calculatePercentComplete');

const populatePercentComplete = async (queryInterface, transaction) => {
  const testPlanReports = await queryInterface.sequelize.query(
    `SELECT id FROM "TestPlanReport"`,
    { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
  );

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

    const percentComplete = calculatePercentComplete({ draftTestPlanRuns });

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
