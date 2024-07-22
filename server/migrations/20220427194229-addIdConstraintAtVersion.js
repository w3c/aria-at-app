'use strict';

module.exports = {
  up: queryInterface => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.addConstraint('AtVersion', {
        type: 'primary key',
        name: 'AtVersion_pkey',
        fields: ['id'],
        transaction
      });
    });
  },

  down: queryInterface => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeConstraint('AtVersion', 'AtVersion_pkey', {
        transaction
      });
    });
  }
};
