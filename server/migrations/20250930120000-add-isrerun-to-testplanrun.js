'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('TestPlanRun');
    if (!table.isRerun) {
      await queryInterface.addColumn('TestPlanRun', 'isRerun', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.removeColumn('TestPlanRun', 'isRerun');
    } catch (e) {
      console.error(e);
    }
  }
};
