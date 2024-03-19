'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.addColumn(
        'AtBrowsers',
        'isCandidate',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          allowNull: false
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'AtBrowsers',
        'isRecommended',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          allowNull: false
        },
        { transaction }
      );
    });
  },

  async down(queryInterface /* , Sequelize */) {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn('AtBrowsers', 'isCandidate', {
        transaction
      });
      await queryInterface.removeColumn('AtBrowsers', 'isRecommended', {
        transaction
      });
    });
  }
};
