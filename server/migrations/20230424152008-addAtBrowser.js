'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AtBrowsers', {
      atId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'At',
          key: 'id'
        }
      },
      browserId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Browser',
          key: 'id'
        }
      }
    });
  },

  down: async (queryInterface /* , Sequelize */) => {
    await queryInterface.dropTable('AtBrowsers');
  }
};
