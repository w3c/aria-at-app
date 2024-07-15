'use strict';

const { sequelize } = require('../models');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      const [latestTestPlanVersion] = await queryInterface.sequelize.query(
        `select id
         from "TestPlanVersion"
         order by id desc
         limit 1`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (latestTestPlanVersion) {
        await sequelize.query(
          `SELECT setval(pg_get_serial_sequence('"TestPlanVersion"', 'id'), :currentSequenceValue)`,
          {
            replacements: { currentSequenceValue: latestTestPlanVersion.id },
            transaction
          }
        );
      }
    });
  },

  async down() {}
};
