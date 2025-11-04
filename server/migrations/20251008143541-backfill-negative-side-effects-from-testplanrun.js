'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Fetch all TestPlanRuns with their testResults
    const testPlanRuns = await queryInterface.sequelize.query(
      'SELECT id, "testResults" FROM "TestPlanRun" WHERE "testResults" IS NOT NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Use batching to insert negative side effects to avoid memory issues
    const batchSize = 500;
    let negativeSideEffectBatch = [];

    for (const testPlanRun of testPlanRuns) {
      const testResults = testPlanRun.testResults;

      if (!testResults || !Array.isArray(testResults)) {
        continue;
      }

      for (const testResult of testResults) {
        if (
          !testResult.scenarioResults ||
          !Array.isArray(testResult.scenarioResults)
        ) {
          continue;
        }

        for (const scenarioResult of testResult.scenarioResults) {
          if (
            !scenarioResult.negativeSideEffects ||
            !Array.isArray(scenarioResult.negativeSideEffects)
          ) {
            continue;
          }

          for (const negativeSideEffect of scenarioResult.negativeSideEffects) {
            // Build the negative side effect record
            const negativeSideEffectRecord = {
              testPlanRunId: testPlanRun.id,
              testResultId: testResult.id,
              scenarioResultId: scenarioResult.id,
              negativeSideEffectId: negativeSideEffect.id,
              impact: negativeSideEffect.impact,
              details: negativeSideEffect.details || null,
              highlightRequired: negativeSideEffect.highlightRequired || false,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            negativeSideEffectBatch.push(negativeSideEffectRecord);

            // Insert in batches
            if (negativeSideEffectBatch.length >= batchSize) {
              await queryInterface.bulkInsert(
                'NegativeSideEffect',
                negativeSideEffectBatch
              );
              negativeSideEffectBatch = [];
            }
          }
        }
      }
    }

    // Insert remainder
    if (negativeSideEffectBatch.length > 0) {
      await queryInterface.bulkInsert(
        'NegativeSideEffect',
        negativeSideEffectBatch
      );
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.bulkDelete('NegativeSideEffect', null, {});
    } catch (e) {
      console.error('Error clearing NegativeSideEffect table:', e);
    }
  }
};
