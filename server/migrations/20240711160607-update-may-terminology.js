'use strict';

/** @type {import('sequelize-cli').Migration} */
const updateMetricsTerminology = async (
  queryInterface,
  Sequelize,
  oldTerm,
  newTerm
) => {
  const [reports] = await queryInterface.sequelize.query(
    'SELECT id, metrics FROM "TestPlanReport";'
  );

  const updatePromises = reports.map(report => {
    const { metrics } = report;

    if (metrics.mayFormatted) {
      metrics.mayFormatted = metrics.mayFormatted.replace(oldTerm, newTerm);
    }

    return queryInterface.sequelize.query(
      'UPDATE "TestPlanReport" SET metrics = :metrics WHERE id = :id',
      {
        replacements: {
          metrics: JSON.stringify(metrics),
          id: report.id
        },
        type: Sequelize.QueryTypes.UPDATE
      }
    );
  });

  await Promise.all(updatePromises);
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await updateMetricsTerminology(
      queryInterface,
      Sequelize,
      'passed',
      'supported'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await updateMetricsTerminology(
      queryInterface,
      Sequelize,
      'supported',
      'passed'
    );
  }
};
