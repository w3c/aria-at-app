'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('TestPlanReport');
    if (!table.onHold) {
      await queryInterface.addColumn('TestPlanReport', 'onHold', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.removeColumn('TestPlanReport', 'onHold');
    } catch (e) {
      console.error(e);
    }
  }
};
