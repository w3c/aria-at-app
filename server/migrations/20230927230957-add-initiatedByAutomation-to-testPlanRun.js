'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('TestPlanRun', 'initiatedByAutomation', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },
  down: async queryInterface => {
    await queryInterface.removeColumn('TestPlanRun', 'initiatedByAutomation');
  }
};
