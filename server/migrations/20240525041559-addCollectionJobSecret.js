'use strict';
const uuid = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.addColumn(
        'CollectionJob',
        'secret',
        {
          type: Sequelize.DataTypes.UUID,
          allowNull: false,
          defaultValue: uuid.NIL
        },
        { transaction }
      );
    });
  },
  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn('CollectionJob', 'secret', {
        transaction
      });
    });
  }
};
