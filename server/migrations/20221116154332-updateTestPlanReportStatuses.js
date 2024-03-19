'use strict';

module.exports = {
  up: queryInterface => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.sequelize.query(
        `update "TestPlanReport" set status = 'CANDIDATE' where status = 'FINALIZED'`,
        {
          transaction
        }
      );
    });
  },

  down: queryInterface => {
    return queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.sequelize.query(
        `update "TestPlanReport" set status = 'FINALIZED' where status = 'CANDIDATE';
                update "TestPlanReport" set status = 'FINALIZED' where status = 'RECOMMENDED'`,
        {
          transaction
        }
      );
    });
  }
};
