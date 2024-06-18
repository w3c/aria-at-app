'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
          UPDATE
            "At"
          SET
            "key" = CASE
              WHEN id = 1 THEN 'jaws'
              WHEN id = 2 THEN 'nvda'
              WHEN id = 3 THEN 'voiceover_macos'
              ELSE null
            END;
        `);

    await queryInterface.sequelize.query(`
          UPDATE
            "Browser"
          SET
            "key" = CASE
              WHEN id = 1 THEN 'firefox'
              WHEN id = 2 THEN 'chrome'
              WHEN id = 3 THEN 'safari_macos'
              ELSE null
            END;
        `);
  },

  async down(queryInterface) {
    await queryInterface.bulkUpdate('At', { key: null });
    await queryInterface.bulkUpdate('Browser', { key: null });
  }
};
