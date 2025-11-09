'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Assertion table, frozen to avoid changes in migration
    const assertionTable = await queryInterface
      .describeTable('Assertion')
      .catch(() => null);
    if (!assertionTable) {
      await queryInterface.createTable('Assertion', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        testPlanVersionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'TestPlanVersion',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        testId: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        assertionIndex: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        priority: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        text: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        rawAssertionId: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        assertionStatement: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        assertionPhrase: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        assertionExceptions: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        encodedId: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: true
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

      // Add index on testPlanVersionId for efficient queries
      await queryInterface.addIndex('Assertion', ['testPlanVersionId'], {
        name: 'assertion_test_plan_version_id_idx'
      });

      // Add index on encodedId for efficient lookups
      await queryInterface.addIndex('Assertion', ['encodedId'], {
        name: 'assertion_encoded_id_idx',
        unique: true
      });

      // Add composite index for testId + assertionIndex
      await queryInterface.addIndex('Assertion', ['testId', 'assertionIndex'], {
        name: 'assertion_test_id_index_idx'
      });
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.dropTable('Assertion');
    } catch (e) {
      console.error('Error dropping Assertion table:', e);
    }
  }
};
