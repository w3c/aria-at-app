'use strict';

const { recalculateMetrics, dumpTable } = require('./utils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async transaction => {
      await dumpTable('TestPlanReport');
      await recalculateMetrics(queryInterface, transaction);
    });
  },

  async down() {
    // Restore dumped TestPlanReport table if needed
  }
};
