'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.addColumn(
        'TestPlanRun',
        'isPrimary',
        {
          type: Sequelize.DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false
        },
        { transaction }
      );
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn('TestPlanRun', 'isPrimary', {
        transaction
      });
    });
  }
};
