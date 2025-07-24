'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('TestPlanReport', 'percentComplete', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('TestPlanReport', 'percentComplete');
  }
};
