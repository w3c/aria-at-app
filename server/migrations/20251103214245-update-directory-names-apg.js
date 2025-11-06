'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE "TestPlanVersion"
       SET directory = 'apg/' || directory
       WHERE directory IS NOT NULL AND directory NOT LIKE 'apg/%'`
    );

    await queryInterface.sequelize.query(
      `UPDATE "TestPlan"
       SET directory = 'apg/' || directory
       WHERE directory IS NOT NULL AND directory NOT LIKE 'apg/%'`
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE "TestPlanVersion"
       SET directory = substring(directory FROM 5)
       WHERE directory IS NOT NULL AND directory LIKE 'apg/%'`
    );

    await queryInterface.sequelize.query(
      `UPDATE "TestPlan"
       SET directory = substring(directory FROM 5)
       WHERE directory IS NOT NULL AND directory LIKE 'apg/%'`
    );
  }
};
