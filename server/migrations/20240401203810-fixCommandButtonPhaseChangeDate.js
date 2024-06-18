'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async transaction => {
      // Update date for Command Button V23.12.13 to be the time V22.04.04
      // was deprecated (+1 second)
      await queryInterface.sequelize.query(
        `update "TestPlanVersion"
                 set "candidatePhaseReachedAt" = '2024-01-24 02:06:55.460000 +00:00'
                 where id = 62353
                   and "gitSha" = '565a87b4111acebdb883d187b581e82c42a73844'
                   and directory = 'command-button'`,
        {
          transaction
        }
      );

      // Update deprecation date for Command Button V23.12.06 to be a
      // second before its current time. It was the same time Command
      // Button V23.12.13 was updated to draft which isn't functionally
      // possible
      await queryInterface.sequelize.query(
        `update "TestPlanVersion"
                 set "deprecatedAt" = '2023-12-13 22:18:04.298000 +00:00'
                 where id = 56298
                   and "gitSha" = 'd9a19f815d0f21194023b1c5919eb3b04d5c1ab7'
                   and directory = 'command-button'`,
        {
          transaction
        }
      );
    });
  },
  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.sequelize.query(
        `update "TestPlanVersion"
                 set "candidatePhaseReachedAt" = '2022-05-05 21:34:31.000000 +00:00'
                 where id = 62353
                   and "gitSha" = '565a87b4111acebdb883d187b581e82c42a73844'
                   and directory = 'command-button'`,
        {
          transaction
        }
      );

      await queryInterface.sequelize.query(
        `update "TestPlanVersion"
                 set "deprecatedAt" = '2023-12-13 22:19:04.298000 +00:00'
                 where id = 56298
                   and "gitSha" = 'd9a19f815d0f21194023b1c5919eb3b04d5c1ab7'
                   and directory = 'command-button'`,
        {
          transaction
        }
      );
    });
  }
};
