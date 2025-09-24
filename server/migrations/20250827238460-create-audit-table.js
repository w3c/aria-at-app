'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Audit', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      eventType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      performedByUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      entityId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Audit');
  }
};
