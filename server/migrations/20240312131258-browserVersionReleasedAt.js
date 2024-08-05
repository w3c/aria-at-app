'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.addColumn(
        'BrowserVersion',
        'releasedAt',
        {
          type: Sequelize.DataTypes.DATE,
          allowNull: true
        },
        { transaction }
      );
    });
  },

  async down(queryInterface /* , Sequelize */) {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn('AtVersion', 'releasedAt', {
        transaction
      });
    });
  }
};
