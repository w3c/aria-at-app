'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create NegativeSideEffect table, frozen to avoid changes in migration
    const negativeSideEffectTable = await queryInterface
      .describeTable('NegativeSideEffect')
      .catch(() => null);
    if (!negativeSideEffectTable) {
      await queryInterface.createTable('NegativeSideEffect', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        testPlanRunId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'TestPlanRun',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        testResultId: {
          type: Sequelize.TEXT,
          allowNull: false,
          comment: 'The test result ID from TestPlanRun.testResults JSONB'
        },
        scenarioResultId: {
          type: Sequelize.TEXT,
          allowNull: false,
          comment: 'The scenario result ID from TestPlanRun.testResults JSONB'
        },
        negativeSideEffectId: {
          type: Sequelize.TEXT,
          allowNull: false,
          comment:
            'The ID from negativeSideEffects.json (e.g., EXCESSIVELY_VERBOSE)'
        },
        impact: {
          type: Sequelize.TEXT,
          allowNull: false,
          comment: 'SEVERE, MODERATE, etc.'
        },
        details: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Additional details provided by the tester'
        },
        highlightRequired: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
          comment:
            'Whether a highlight was required for this negative side effect'
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });

      // Add indexes for efficient queries
      await queryInterface.addIndex('NegativeSideEffect', ['testPlanRunId'], {
        name: 'negative_side_effect_test_plan_run_id_idx'
      });

      await queryInterface.addIndex('NegativeSideEffect', ['testResultId'], {
        name: 'negative_side_effect_test_result_id_idx'
      });

      await queryInterface.addIndex(
        'NegativeSideEffect',
        ['scenarioResultId'],
        {
          name: 'negative_side_effect_scenario_result_id_idx'
        }
      );

      await queryInterface.addIndex(
        'NegativeSideEffect',
        ['negativeSideEffectId'],
        {
          name: 'negative_side_effect_negative_side_effect_id_idx'
        }
      );

      await queryInterface.addIndex('NegativeSideEffect', ['impact'], {
        name: 'negative_side_effect_impact_idx'
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('NegativeSideEffect');
  }
};
