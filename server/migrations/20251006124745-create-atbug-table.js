'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create AtBug table
    const atBugTable = await queryInterface
      .describeTable('AtBug')
      .catch(() => null);
    if (!atBugTable) {
      await queryInterface.createTable('AtBug', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        title: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        bugId: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        url: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        atId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'At',
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

      // Add index on atId for efficient queries
      await queryInterface.addIndex('AtBug', ['atId'], {
        name: 'atbug_at_id_idx'
      });

      // Add composite unique index on (atId, bugId, url, title) to prevent fully duplicate entries
      // Note: bugId alone can be duplicated as it's just for display purposes
      await queryInterface.addIndex(
        'AtBug',
        ['atId', 'bugId', 'url', 'title'],
        {
          name: 'atbug_at_id_bug_id_url_title_unique_idx',
          unique: true
        }
      );
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.dropTable('AtBug');
    } catch (e) {
      console.error('Error dropping AtBug table:', e);
    }
  }
};
