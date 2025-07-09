const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('TestPlanReport', 'historicalReportId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'TestPlanReport',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addIndex('TestPlanReport', ['historicalReportId'], {
      name: 'idx_test_plan_report_historical_report_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(
      'TestPlanReport',
      'idx_test_plan_report_historical_report_id'
    );
    await queryInterface.removeColumn('TestPlanReport', 'historicalReportId');
  }
};
