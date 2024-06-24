'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.addColumn(
        'BrowserVersion',
        'id',
        {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        { transaction }
      );
      await queryInterface.removeConstraint(
        'BrowserVersion',
        'BrowserVersion_pkey',
        { transaction }
      );
      await queryInterface.addConstraint('BrowserVersion', {
        type: 'primary key',
        name: 'BrowserVersion_pkey',
        fields: ['id'],
        transaction
      });
      await queryInterface.renameColumn(
        'BrowserVersion',
        'browserVersion',
        'name',
        { transaction }
      );
    });
  },

  down: queryInterface => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn('BrowserVersion', 'id', {
        transaction
      });
      await queryInterface.renameColumn(
        'BrowserVersion',
        'name',
        'browserVersion',
        { transaction }
      );
      await queryInterface.addConstraint('BrowserVersion', {
        type: 'primary key',
        name: 'BrowserVersion_pkey',
        fields: ['browserId', 'browserVersion'],
        transaction
      });
    });
  }
};
