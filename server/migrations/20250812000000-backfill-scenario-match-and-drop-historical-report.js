'use strict';

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const { outputsMatch } = require('../util/outputNormalization');
      const MATCH_TYPE = {
        SAME_SCENARIO: 'SAME_SCENARIO',
        NONE: 'NONE'
      };

      // Consider all rerun reports (those with a historicalReportId)
      const [rerunReports] = await queryInterface.sequelize.query(
        `SELECT id, "historicalReportId" FROM "TestPlanReport" WHERE "historicalReportId" IS NOT NULL`,
        { transaction }
      );

      for (const row of rerunReports) {
        const historicalReportId = row.historicalReportId;
        if (!historicalReportId) continue;

        // Build a map of historical scenario results by scenarioId from the chosen primary run
        const [historicalRuns] = await queryInterface.sequelize.query(
          `SELECT id, "testResults", "isPrimary" FROM "TestPlanRun" WHERE "testPlanReportId" = :id ORDER BY id ASC`,
          { replacements: { id: historicalReportId }, transaction }
        );
        const pickHistoricalRun = () => {
          const primary = historicalRuns.find(r => r && r.isPrimary);
          if (primary) return primary;
          const withCompleted = historicalRuns.find(r => {
            const trs = Array.isArray(r?.testResults) ? r.testResults : [];
            return trs.some(tr => tr && tr.completedAt);
          });
          if (withCompleted) return withCompleted;
          return historicalRuns[0] || null;
        };
        const chosenHistoricalRun = pickHistoricalRun();

        // Fetch minimal metadata for the historical report for source fields
        const [historicalReportRows] = await queryInterface.sequelize.query(
          `SELECT id, "testPlanVersionId" FROM "TestPlanReport" WHERE id = :id`,
          { replacements: { id: historicalReportId }, transaction }
        );
        const historicalMeta =
          historicalReportRows && historicalReportRows[0]
            ? historicalReportRows[0]
            : { id: historicalReportId, testPlanVersionId: null };

        const historicalByScenarioId = new Map();
        if (chosenHistoricalRun) {
          const testResults = Array.isArray(chosenHistoricalRun.testResults)
            ? chosenHistoricalRun.testResults
            : [];
          const finalizedTestResults = testResults.filter(
            tr => tr && tr.completedAt
          );

          // Prefetch version names for ids present in finalized results
          const atVersionIds = Array.from(
            new Set(
              finalizedTestResults
                .map(tr =>
                  tr?.atVersionId != null ? Number(tr.atVersionId) : null
                )
                .filter(id => id != null && Number.isFinite(id))
            )
          );
          const browserVersionIds = Array.from(
            new Set(
              finalizedTestResults
                .map(tr =>
                  tr?.browserVersionId != null
                    ? Number(tr.browserVersionId)
                    : null
                )
                .filter(id => id != null && Number.isFinite(id))
            )
          );
          const atVersionIdToName = new Map();
          const browserVersionIdToName = new Map();
          if (atVersionIds.length > 0) {
            const [rows] = await queryInterface.sequelize.query(
              `SELECT id, name FROM "AtVersion" WHERE id IN (:ids)`,
              { replacements: { ids: atVersionIds }, transaction }
            );
            for (const r of rows) atVersionIdToName.set(r.id, r.name);
          }
          if (browserVersionIds.length > 0) {
            const [rows] = await queryInterface.sequelize.query(
              `SELECT id, name FROM "BrowserVersion" WHERE id IN (:ids)`,
              { replacements: { ids: browserVersionIds }, transaction }
            );
            for (const r of rows) browserVersionIdToName.set(r.id, r.name);
          }

          for (const tr of finalizedTestResults) {
            const scenarioResults = Array.isArray(tr.scenarioResults)
              ? tr.scenarioResults
              : [];
            for (const sr of scenarioResults) {
              if (!sr || sr.scenarioId == null) continue;
              const assertionResultsById = Object.fromEntries(
                (Array.isArray(sr.assertionResults)
                  ? sr.assertionResults
                  : []
                ).map(a => [
                  String(a?.assertionId ?? a?.assertion?.id),
                  { passed: a?.passed, failedReason: a?.failedReason }
                ])
              );
              const atVersionId =
                tr?.atVersionId != null ? Number(tr.atVersionId) : null;
              const browserVersionId =
                tr?.browserVersionId != null
                  ? Number(tr.browserVersionId)
                  : null;
              const atVersionName =
                (atVersionId != null && atVersionIdToName.get(atVersionId)) ||
                '';
              const browserVersionName =
                (browserVersionId != null &&
                  browserVersionIdToName.get(browserVersionId)) ||
                '';
              const testResultId = tr?.id ?? null;
              const testPlanVersionId = historicalMeta.testPlanVersionId;
              const output = sr.output;

              // Only create a source when all non-nullable fields are present
              const hasAllRequired =
                testPlanVersionId != null &&
                historicalMeta.id != null &&
                testResultId != null &&
                sr.scenarioId != null &&
                atVersionId != null &&
                browserVersionId != null &&
                typeof atVersionName === 'string' &&
                typeof browserVersionName === 'string' &&
                typeof output === 'string';

              if (!hasAllRequired) {
                continue;
              }

              historicalByScenarioId.set(String(sr.scenarioId), {
                testPlanReportId: historicalMeta.id,
                testPlanVersionId,
                testResultId,
                scenarioId: sr.scenarioId,
                atVersionId,
                atVersionName,
                browserVersionId,
                browserVersionName,
                output,
                assertionResultsById,
                negativeSideEffects: sr.negativeSideEffects || null,
                hasNegativeSideEffect: sr.hasNegativeSideEffect || null
              });
            }
          }
        }

        // Read rerun runs and set SAME_SCENARIO / NONE matches based on output equality (normalized)
        const [rerunRuns] = await queryInterface.sequelize.query(
          `SELECT id, "testResults", "isPrimary" FROM "TestPlanRun" WHERE "testPlanReportId" = :id ORDER BY id ASC`,
          { replacements: { id: row.id }, transaction }
        );

        for (const run of rerunRuns) {
          const newResults = (
            Array.isArray(run.testResults) ? run.testResults : []
          ).map(tr => ({
            ...tr,
            scenarioResults: (Array.isArray(tr.scenarioResults)
              ? tr.scenarioResults
              : []
            ).map(sr => {
              const hist =
                historicalByScenarioId.get(String(sr.scenarioId)) || null;
              const hasAssertions =
                Array.isArray(sr.assertionResults) &&
                sr.assertionResults.length > 0;
              const isSame =
                hasAssertions && hist && outputsMatch(hist?.output, sr?.output);
              const match = {
                type: isSame ? MATCH_TYPE.SAME_SCENARIO : MATCH_TYPE.NONE,
                source: hist ? { ...hist } : null
              };
              // Only set the match; do not copy or modify assertion results
              return {
                ...sr,
                match
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

      const [allReports] = await queryInterface.sequelize.query(
        `SELECT id FROM "TestPlanReport"`,
        { transaction }
      );

      for (const row of allReports) {
        // Read runs and pick primary, else one with completed results, else first by id
        const [runs] = await queryInterface.sequelize.query(
          `SELECT id, "testResults", "isPrimary" FROM "TestPlanRun" WHERE "testPlanReportId" = :id ORDER BY id ASC`,
          { replacements: { id: row.id }, transaction }
        );
        const primaryRun = runs.find(r => r && r.isPrimary);
        const runsWithCompleted = runs.filter(r => {
          const trs = Array.isArray(r?.testResults) ? r.testResults : [];
          return trs.some(tr => tr && tr.completedAt);
        });
        const orderedRuns = [];
        if (primaryRun) orderedRuns.push(primaryRun);
        for (const r of runsWithCompleted)
          if (!orderedRuns.includes(r)) orderedRuns.push(r);
        for (const r of runs) if (!orderedRuns.includes(r)) orderedRuns.push(r);

        let historicalId = null;
        for (const r of orderedRuns) {
          const testResults = Array.isArray(r?.testResults)
            ? r.testResults
            : [];
          const firstTest = testResults[0] || null;
          const firstScenario =
            firstTest && Array.isArray(firstTest.scenarioResults)
              ? firstTest.scenarioResults[0]
              : null;
          const candidate = firstScenario?.match?.source?.testPlanReportId;
          if (candidate) {
            historicalId = candidate;
            break;
          }
        }

        if (historicalId) {
          await queryInterface.sequelize.query(
            `UPDATE "TestPlanReport" SET "historicalReportId" = :historicalReport WHERE id = :id`,
            {
              replacements: { historicalReport: historicalId, id: row.id },
              transaction
            }
          );
        }
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
