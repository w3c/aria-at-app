'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('BrowserVersionToAtAndAtVersions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      browser_version_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'browser_version',
          key: 'id'
        },
        allowNull: false
      },
      at_version_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'at_version',
          key: 'id'
        },
        allowNull: false
      },
      at_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'at',
          key: 'id'
        },
        allowNull: false
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: queryInterface => {
    return queryInterface.dropTable('BrowserVersionToAtAndAtVersions');
  }
};
