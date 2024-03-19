'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.addColumn(
        'TestPlanReport',
        'candidateStatusReachedAt',
        {
          type: Sequelize.DataTypes.DATE,
          defaultValue: null,
          allowNull: true
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'TestPlanReport',
        'recommendedStatusReachedAt',
        {
          type: Sequelize.DataTypes.DATE,
          defaultValue: null,
          allowNull: true
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'TestPlanReport',
        'recommendedStatusTargetDate',
        {
          type: Sequelize.DataTypes.DATE,
          defaultValue: null,
          allowNull: true
        },
        { transaction }
      );
      await queryInterface.sequelize.query(
        `
                update "TestPlanReport" set "candidateStatusReachedAt" = current_date where status = 'IN_REVIEW';
                update "TestPlanReport" set "recommendedStatusReachedAt" = current_date where status = 'FINALIZED';
                update "TestPlanReport" set "candidateStatusReachedAt" = current_date - 180 where status = 'FINALIZED';
            `,
        { transaction }
      );
    });
  },

  down: queryInterface => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn(
        'TestPlanReport',
        'candidateStatusReachedAt',
        { transaction }
      );
      await queryInterface.removeColumn(
        'TestPlanReport',
        'recommendedStatusReachedAt',
        { transaction }
      );
      await queryInterface.removeColumn(
        'TestPlanReport',
        'recommendedStatusTargetDate',
        { transaction }
      );
    });
  }
};
