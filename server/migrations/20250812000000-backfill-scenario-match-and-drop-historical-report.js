'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const [rerunReports] = await queryInterface.sequelize.query(
        `SELECT id FROM "TestPlanReport" WHERE "historicalReportId" IS NOT NULL AND "markedFinalAt" IS NULL`,
        { transaction }
      );

      const getGraphQLContext = require('../graphql-context');
      const {
        computeMatchesForRerunReport
      } = require('../services/VerdictService/computeMatchesForRerunReport');
      const {
        getTestPlanReportById
      } = require('../models/services/TestPlanReportService');

      for (const row of rerunReports) {
        const context = getGraphQLContext({ req: { transaction } });
        const testPlanReport = await getTestPlanReportById({
          id: row.id,
          transaction
        });
        const currentOutputsByScenarioId = {};
        for (const run of testPlanReport.testPlanRuns || []) {
          for (const tr of run.testResults || []) {
            for (const sr of tr.scenarioResults || []) {
              currentOutputsByScenarioId[String(sr.scenarioId)] = sr.output;
            }
          }
        }
        const matches = await computeMatchesForRerunReport({
          rerunTestPlanReportId: row.id,
          context,
          currentOutputsByScenarioId
        });

        for (const run of testPlanReport.testPlanRuns || []) {
          const newResults = (run.testResults || []).map(tr => ({
            ...tr,
            scenarioResults: (tr.scenarioResults || []).map(sr => ({
              ...sr,
              match: matches.get(String(sr.scenarioId)) || null
            }))
          }));

          await queryInterface.sequelize.query(
            `UPDATE "TestPlanRun" SET "testResults" = :json WHERE id = :id`,
            {
              replacements: { json: JSON.stringify(newResults), id: run.id },
              transaction
            }
          );
        }
      }

      await queryInterface.removeColumn(
        'TestPlanReport',
        'historicalReportId',
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'TestPlanReport',
        'historicalReportId',
        {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
