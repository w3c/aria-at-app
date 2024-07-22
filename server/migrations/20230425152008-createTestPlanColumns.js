'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'TestPlanVersion',
        'testPlanId',
        {
          type: Sequelize.DataTypes.INTEGER,
          references: {
            model: {
              tableName: 'TestPlan'
            },
            key: 'id'
          }
        },
        { transaction: t }
      );

      await queryInterface.addColumn(
        'TestPlanReport',
        'testPlanId',
        {
          type: Sequelize.DataTypes.INTEGER,
          references: {
            model: {
              tableName: 'TestPlan'
            },
            key: 'id'
          }
        },
        { transaction: t }
      );

      await t.commit();
    } catch (error) {
      await t.rollback();
    }
  },

  async down(queryInterface) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('TestPlan', { transaction: t });
      await queryInterface.removeColumn('TestPlanVersion', 'testPlanId', {
        transaction: t
      });
      await queryInterface.removeColumn('TestPlanReport', 'testPlanId', {
        transaction: t
      });

      await t.commit();
    } catch (error) {
      await t.rollback();
    }
  }
};
