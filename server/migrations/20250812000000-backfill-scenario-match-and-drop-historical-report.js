'use strict';

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const [rerunReports] = await queryInterface.sequelize.query(
        `SELECT id FROM "TestPlanReport" WHERE "historicalReportId" IS NOT NULL AND "markedFinalAt" IS NULL`,
        { transaction }
      );

      const getGraphQLContext = require('../graphql-context');
      const {
        computeMatchesForRerunReport,
        MATCH_TYPE
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
            scenarioResults: (tr.scenarioResults || []).map(sr => {
              const m = matches.get(String(sr.scenarioId));
              const isSameOrCross =
                m &&
                (m.type === MATCH_TYPE.SAME_SCENARIO ||
                  m.type === MATCH_TYPE.CROSS_SCENARIO);

              const existingAssertionResults = sr.assertionResults || [];
              const sourceAssertionMap = m?.source?.assertionResultsById || {};

              let newAssertionResults;
              if (isSameOrCross) {
                if (existingAssertionResults.length > 0) {
                  newAssertionResults = existingAssertionResults.map(
                    assertionResult => {
                      const copied =
                        sourceAssertionMap[String(assertionResult.assertionId)];
                      if (copied) {
                        return {
                          ...assertionResult,
                          passed: copied.passed,
                          failedReason:
                            copied.failedReason === undefined
                              ? null
                              : copied.failedReason
                        };
                      }
                      return {
                        ...assertionResult,
                        passed: null,
                        failedReason: 'AUTOMATED_OUTPUT_DIFFERS'
                      };
                    }
                  );
                } else {
                  // No existing assertions; build from source assertions
                  newAssertionResults = Object.entries(sourceAssertionMap).map(
                    ([assertionId, copied]) => ({
                      assertionId: Number(assertionId),
                      passed: copied.passed,
                      failedReason:
                        copied.failedReason === undefined
                          ? null
                          : copied.failedReason
                    })
                  );
                }
              } else {
                // Not a match; set to null verdicts if any exist
                newAssertionResults = existingAssertionResults.map(
                  assertionResult => ({
                    ...assertionResult,
                    passed: null,
                    failedReason: 'AUTOMATED_OUTPUT_DIFFERS'
                  })
                );
              }

              return {
                ...sr,
                assertionResults: newAssertionResults,
                unexpectedBehaviors: isSameOrCross
                  ? m?.source?.unexpectedBehaviors ?? null
                  : null,
                hasUnexpected: isSameOrCross
                  ? m?.source?.hasUnexpected ?? null
                  : null,
                match: m || { type: MATCH_TYPE.NONE, source: null }
              };
            })
          }));

          await queryInterface.sequelize.query(
            `UPDATE "TestPlanRun" SET "testResults" = :json WHERE id = :id`,
            {
              replacements: { json: JSON.stringify(newResults), id: run.id },
              transaction
            }
          );
        }

        // If every scenario matched (SAME or CROSS), auto-finalize the report
        let allOutputsMatch = true;
        for (const [, m] of matches.entries()) {
          if (
            !m ||
            m.type === MATCH_TYPE.NONE ||
            m.type === MATCH_TYPE.INCOMPLETE
          )
            allOutputsMatch = false;
        }
        if (allOutputsMatch) {
          await queryInterface.sequelize.query(
            `UPDATE "TestPlanReport" SET "markedFinalAt" = NOW() WHERE id = :id AND "markedFinalAt" IS NULL`,
            { replacements: { id: row.id }, transaction }
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
