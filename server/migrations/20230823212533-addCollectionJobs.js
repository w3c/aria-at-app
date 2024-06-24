'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CollectionJob', {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'QUEUED'
      },
      externalLogsUrl: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      testPlanRunId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'TestPlanRun',
          key: 'id'
        },
        allowNull: true,
        onDelete: 'SET NULL',
        unique: true
      }
    });
  },
  down: async queryInterface => {
    return queryInterface.dropTable('CollectionJob');
  }
};
