'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async transaction => {
      // Removing to support needs of https://github.com/w3c/aria-at-app/issues/1417
      // before running Automated Report Collection again
      await queryInterface.sequelize.query(
        `
          delete
          from "TestPlanReport"
          where id in (399, 400, 401, 402, 403, 404, 405, 406, 407, 408)
            and "atId" = 2
            and "createdAt" between '2025-05-29 19:00' and '2025-05-29 19:01'
        `,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
          delete
          from "UpdateEvent"
          where id = 1
        `,
        { transaction }
      );
    });
  },

  async down() {
    // Note: This migration cannot be reversed as it deletes data
    // We could potentially restore from a backup if needed
  }
};
