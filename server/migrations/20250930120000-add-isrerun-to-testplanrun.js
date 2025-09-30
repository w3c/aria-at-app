'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('TestPlanRun');
    if (!table.isRerun) {
      await queryInterface.addColumn('TestPlanRun', 'isRerun', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }

    // Backfill: mark runs as rerun if any scenarioResult has a non-null match.type
    await queryInterface.sequelize.query(
      `
        UPDATE "TestPlanRun" tpr
        SET "isRerun" = TRUE
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_array_elements(COALESCE(tpr."testResults", '[]'::jsonb)) AS tr
          CROSS JOIN jsonb_array_elements(COALESCE(tr->'scenarioResults', '[]'::jsonb)) AS sr
          WHERE (sr->'match'->>'type') IS NOT NULL AND (sr->'match'->>'type') <> ''
        );
      `
    );
  },

  async down(queryInterface) {
    try {
      await queryInterface.removeColumn('TestPlanRun', 'isRerun');
    } catch (e) {
      console.error(e);
    }
  }
};
