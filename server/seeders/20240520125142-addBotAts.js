'use strict';

const responseCollectionUserIDs = require('../util/responseCollectionUserIDs');

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
            INSERT INTO "UserAts"
            SELECT
                ${responseCollectionUserIDs['NVDA Bot']} AS userId,
                id AS atId
            FROM "At"
            WHERE
                "At"."key" = 'nvda'
            ;
        `);
    await queryInterface.sequelize.query(`
            INSERT INTO "UserAts"
            SELECT
                ${responseCollectionUserIDs['VoiceOver Bot']} AS userId,
                id AS atId
            FROM "At"
            WHERE
                "At"."key" = 'voiceover_macos'
            ;
        `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
            DELETE FROM "UserAts"
            WHERE "UserAts"."userId" IN (
                ${responseCollectionUserIDs['NVDA Bot']},
                ${responseCollectionUserIDs['VoiceOver Bot']}
            );
        `);
  }
};
