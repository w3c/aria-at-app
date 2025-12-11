'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('AtVersion');
    if (!table.supportedByAutomation) {
      await queryInterface.addColumn('AtVersion', 'supportedByAutomation', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }
    if (!table.latestAutomationSupporting) {
      await queryInterface.addColumn(
        'AtVersion',
        'latestAutomationSupporting',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
      );
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.removeColumn(
        'AtVersion',
        'latestAutomationSupporting'
      );
    } catch (e) {
      console.error(e);
    }
    try {
      await queryInterface.removeColumn('AtVersion', 'supportedByAutomation');
    } catch (e) {
      console.error(e);
    }
  }
};
