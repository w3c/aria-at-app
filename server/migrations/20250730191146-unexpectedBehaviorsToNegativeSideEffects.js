'use strict';

// Rename the key of an object in-place.
const renameKey = (object, oldKey, newKey) => {
  if (!(oldKey in object)) {
    throw new Error(
      `Unable to rename key "${oldKey}" to "${newKey}" because the former key does not exist. Object: ${JSON.stringify(
        object
      )}`
    );
  }

  if (newKey in object) {
    throw new Error(
      `Unable to rename key "${oldKey}" to "${newKey}" because the latter key already exists. Object: ${JSON.stringify(
        object
      )}`
    );
  }

  object[newKey] = object[oldKey];
  delete object[oldKey];
};

const updateMetrics = async (queryInterface, transaction, direction) => {
  const testPlanReports = await queryInterface.sequelize.query(
    `SELECT id, metrics FROM "TestPlanReport"`,
    { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
  );

  for (const report of testPlanReports) {
    // In the production data, some Test Plan Reports have no metrics defined.
    // Exit early for such Test Plan Reports to avoid a validation error from
    // the `renameKey` function.
    if (Object.keys(report.metrics).length === 0) {
      continue;
    }

    const newMetrics = { ...report.metrics };

    if (direction === 'up') {
      renameKey(
        newMetrics,
        'unexpectedBehaviorCount',
        'negativeSideEffectCount'
      );
      renameKey(
        newMetrics,
        'unexpectedBehaviorsFormatted',
        'negativeSideEffectsFormatted'
      );
    } else {
      renameKey(
        newMetrics,
        'negativeSideEffectCount',
        'unexpectedBehaviorCount'
      );
      renameKey(
        newMetrics,
        'negativeSideEffectsFormatted',
        'unexpectedBehaviorsFormatted'
      );
    }

    await queryInterface.sequelize.query(
      `UPDATE "TestPlanReport" SET metrics = :newMetrics WHERE id = :reportId`,
      {
        replacements: {
          newMetrics: JSON.stringify(newMetrics),
          reportId: report.id
        },
        transaction
      }
    );
  }
};

const updateTestResults = async (queryInterface, transaction, direction) => {
  const testPlanRuns = await queryInterface.sequelize.query(
    `SELECT id, "testResults" FROM "TestPlanRun"`,
    { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
  );

  const [oldKey, newKey] =
    direction === 'up'
      ? ['unexpectedBehaviors', 'negativeSideEffects']
      : ['negativeSideEffects', 'unexpectedBehaviors'];

  for (const run of testPlanRuns) {
    const newTestResults = run.testResults.map(testResults => {
      return {
        ...testResults,
        scenarioResults: testResults.scenarioResults.map(scenarioResults => {
          // In the production dataset, some Scenario Results lack "unexpected
          // behaviors" / "negative side effects". Exit early for such Scenario
          // Results to avoid a validation error from the `renameKey` function.
          if (!(oldKey in scenarioResults)) {
            return scenarioResults;
          }

          const newScenarioResults = { ...scenarioResults };

          renameKey(newScenarioResults, oldKey, newKey);

          return newScenarioResults;
        })
      };
    });

    await queryInterface.sequelize.query(
      `UPDATE "TestPlanRun" SET "testResults" = :newTestResults WHERE id = :runId`,
      {
        replacements: {
          newTestResults: JSON.stringify(newTestResults),
          runId: run.id
        },
        transaction
      }
    );
  }
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await updateMetrics(queryInterface, transaction, 'up');
      await updateTestResults(queryInterface, transaction, 'up');
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await updateMetrics(queryInterface, transaction, 'down');
      await updateTestResults(queryInterface, transaction, 'down');
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
