'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create AssertionAtBug join table
    const assertionAtBugTable = await queryInterface
      .describeTable('AssertionAtBug')
      .catch(() => null);
    if (!assertionAtBugTable) {
      await queryInterface.createTable('AssertionAtBug', {
        assertionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Assertion',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          primaryKey: true
        },
        atBugId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'AtBug',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          primaryKey: true
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

      // Add index on atBugId for efficient reverse lookups
      await queryInterface.addIndex('AssertionAtBug', ['atBugId'], {
        name: 'assertion_atbug_atbug_id_idx'
      });
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.dropTable('AssertionAtBug');
    } catch (e) {
      console.error('Error dropping AssertionAtBug table:', e);
    }
  }
};
