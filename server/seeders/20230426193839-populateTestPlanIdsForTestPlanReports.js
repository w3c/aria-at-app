'use strict';

const { TestPlanReport, TestPlanVersion } = require('../models');

module.exports = {
  async up(queryInterface) {
    const t = await queryInterface.sequelize.transaction();

    try {
      // Add Test Plan Ids to all Test Plan Reports
      const testPlanReports = await TestPlanReport.findAll();
      await Promise.all(
        testPlanReports.map(async report => {
          const testPlanVersion = await TestPlanVersion.findByPk(
            report.dataValues.testPlanVersionId
          );
          return TestPlanReport.update(
            { testPlanId: testPlanVersion.dataValues.testPlanId },
            { where: { id: report.dataValues.id } },
            { transaction: t }
          );
        })
      );
      await t.commit();
    } catch (error) {
      await t.rollback();
    }
  },

  async down(queryInterface) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkUpdate(
        'TestPlanReport',
        {
          testPlanId: null
        },
        {},
        { transaction: t }
      );
      await t.commit();
    } catch (error) {
      await t.rollback();
    }
  }
};
