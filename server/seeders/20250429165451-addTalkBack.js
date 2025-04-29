'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      // Create Google vendor and retrieve id to use with 'At' table
      const [vendor] = await queryInterface.sequelize.query(
        `insert into "Vendor" (name, "createdAt", "updatedAt")
         values ('google', now(), now())
         returning id`,
        {
          type: Sequelize.QueryTypes.INSERT,
          transaction
        }
      );

      // Update NVDA's vendorId column value
      const googleVendorId = vendor[0].id;
      const [at] = await queryInterface.sequelize.query(
        `insert into "At" (name, key, "vendorId")
        values ('TalkBack for Android', 'talkback_android', :vendorId)
        returning id`,
        {
          replacements: { vendorId: googleVendorId },
          transaction
        }
      );

      const [browser] = await queryInterface.sequelize.query(
        `insert into "Browser" (name, key)
        values ('Chrome for Android', 'chrome_android')
        returning id`,
        { transaction }
      );

      // Update AtBrowsers with combination of TalkBack and Chrome on Android
      const talkbackAtId = at[0].id;
      const chromeAndroidBrowserId = browser[0].id;
      await queryInterface.sequelize.query(
        `insert into "AtBrowsers" ("atId", "browserId", "isCandidate", "isRecommended")
        values (:atId, :browserId, false, false)`,
        {
          replacements: {
            atId: talkbackAtId,
            browserId: chromeAndroidBrowserId
          },
          transaction
        }
      );

      // Add AtVersions for TalkBack
      await queryInterface.bulkInsert(
        'AtVersion',
        [
          // TODO: Fix fake dates
          {
            atId: talkbackAtId,
            name: '15.2.1',
            releasedAt: new Date('2023-04-29')
          },
          {
            atId: talkbackAtId,
            name: '15.1',
            releasedAt: new Date('2023-04-28')
          },
          {
            atId: talkbackAtId,
            name: '15.0',
            releasedAt: new Date('2023-04-27')
          },
          {
            atId: talkbackAtId,
            name: '14.2',
            releasedAt: new Date('2023-04-26')
          },
          {
            atId: talkbackAtId,
            name: '14.1',
            releasedAt: new Date('2023-04-27')
          }
        ],
        { transaction }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('At', {
      key: 'talkback_android'
    });

    await queryInterface.bulkDelete('Vendor', {
      name: 'google'
    });
  }
};
