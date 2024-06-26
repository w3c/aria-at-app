'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.renameColumn(
        'TestPlanReport',
        'candidateStatusReachedAt',
        'markedFinalAt',
        { transaction }
      );
      await queryInterface.removeColumn(
        'TestPlanReport',
        'recommendedStatusReachedAt',
        {
          transaction
        }
      );
      await queryInterface.removeColumn(
        'TestPlanReport',
        'recommendedStatusTargetDate',
        {
          transaction
        }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.renameColumn(
        'TestPlanReport',
        'markedFinalAt',
        'candidateStatusReachedAt',
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
    });
  }
};
