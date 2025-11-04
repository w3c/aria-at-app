'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create NegativeSideEffectAtBug junction table
    const junctionTable = await queryInterface
      .describeTable('NegativeSideEffectAtBug')
      .catch(() => null);
    if (!junctionTable) {
      await queryInterface.createTable('NegativeSideEffectAtBug', {
        negativeSideEffectId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'NegativeSideEffect',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        atBugId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'AtBug',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
      await queryInterface.addIndex(
        'NegativeSideEffectAtBug',
        ['negativeSideEffectId'],
        {
          name: 'negative_side_effect_atbug_negative_side_effect_id_idx'
        }
      );

      await queryInterface.addIndex('NegativeSideEffectAtBug', ['atBugId'], {
        name: 'negative_side_effect_atbug_atbug_id_idx'
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('NegativeSideEffectAtBug');
  }
};
