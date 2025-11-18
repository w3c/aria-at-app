'use strict';

const recalculateMetrics = require('./utils/recalculateMetrics');
const { dumpTable } = require('./utils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // From production_dump_20251118.sql, found these to be the faulty reports which prevented progression to RECOMMENDED
    const testPlanReportIdsWithNonMatchingFailures = [419, 472, 475, 516, 433];

    const transaction = await queryInterface.sequelize.transaction();

    // Process each TestPlanReport in parallel
    try {
      await Promise.all(
        testPlanReportIdsWithNonMatchingFailures.map(async testPlanReportId => {
          const testPlanRuns = await queryInterface.sequelize.query(
            `SELECT id, "testResults" FROM "TestPlanRun" WHERE "testPlanReportId" = :testPlanReportId`,
            {
              type: queryInterface.sequelize.QueryTypes.SELECT,
              replacements: { testPlanReportId },
              transaction
            }
          );

          if (testPlanRuns.length === 0) {
            // eslint-disable-next-line
            console.info(
              `No TestPlanRuns found for TestPlanReport ${testPlanReportId}`
            );
            return;
          }

          // Build a set of (testId, scenarioId) pairs that have untestable: true
          // across all TestPlanRuns for this report
          const untestableScenarios = new Set();

          // Collect all scenarios with untestable: true
          for (const run of testPlanRuns) {
            const testResults = Array.isArray(run.testResults)
              ? run.testResults
              : [];

            for (const testResult of testResults) {
              const scenarioResults = Array.isArray(testResult.scenarioResults)
                ? testResult.scenarioResults
                : [];

              for (const scenarioResult of scenarioResults) {
                if (
                  scenarioResult.untestable === true &&
                  testResult.testId &&
                  scenarioResult.scenarioId
                ) {
                  const key = `${testResult.testId}:${scenarioResult.scenarioId}`;
                  untestableScenarios.add(key);
                }
              }
            }
          }

          if (untestableScenarios.size === 0) {
            // eslint-disable-next-line
            console.info(
              `No untestable scenarios found for TestPlanReport ${testPlanReportId}`
            );
            return;
          }

          // Nw update all TestPlanRuns to set untestable: true
          // for scenarios that are untestable in any run
          const updatedRunIds = [];

          for (const run of testPlanRuns) {
            const testResults = Array.isArray(run.testResults)
              ? run.testResults
              : [];

            let hasChanges = false;
            const updatedTestResults = testResults.map(testResult => {
              const scenarioResults = Array.isArray(testResult.scenarioResults)
                ? testResult.scenarioResults
                : [];

              const updatedScenarioResults = scenarioResults.map(
                scenarioResult => {
                  if (testResult.testId && scenarioResult.scenarioId) {
                    const key = `${testResult.testId}:${scenarioResult.scenarioId}`;
                    if (
                      untestableScenarios.has(key) &&
                      scenarioResult.untestable !== true
                    ) {
                      hasChanges = true;
                      return {
                        ...scenarioResult,
                        untestable: true
                      };
                    }
                  }
                  return scenarioResult;
                }
              );

              return {
                ...testResult,
                scenarioResults: updatedScenarioResults
              };
            });

            if (hasChanges) {
              await queryInterface.sequelize.query(
                `UPDATE "TestPlanRun" SET "testResults" = :testResults WHERE id = :runId`,
                {
                  replacements: {
                    testResults: JSON.stringify(updatedTestResults),
                    runId: run.id
                  },
                  transaction
                }
              );
              updatedRunIds.push(run.id);

              // eslint-disable-next-line
              console.info(
                `Updated TestPlanRun ${run.id} for TestPlanReport ${testPlanReportId}`
              );
            }
          }

          if (updatedRunIds.length > 0) {
            // eslint-disable-next-line
            console.info(
              `TestPlanReport ${testPlanReportId}: Updated ${
                updatedRunIds.length
              } TestPlanRun(s): ${updatedRunIds.join(', ')}`
            );
          }
        })
      );

      await dumpTable('TestPlanRun');
      await recalculateMetrics(queryInterface, transaction);

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down() {
    // This migration cannot be safely reversed as we don't know
    // which scenarios originally had untestable: null vs false
    // Use the dumped TestPlanRun table
  }
};
