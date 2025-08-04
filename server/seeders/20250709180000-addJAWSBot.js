'use strict';

const responseCollectionUserIDs = require('../util/responseCollectionUserIDs');

module.exports = {
  async up(queryInterface) {
    const user = await queryInterface.bulkInsert(
      'User',
      [
        {
          id: responseCollectionUserIDs['JAWS Bot'],
          username: 'JAWS Bot',
          isBot: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      { returning: true }
    );

    await queryInterface.bulkInsert('UserRoles', [
      {
        userId: user[0].id,
        roleName: 'TESTER'
      }
    ]);

    await queryInterface.sequelize.query(`
            INSERT INTO "UserAts"
            SELECT
                ${responseCollectionUserIDs['JAWS Bot']} AS userId,
                id AS atId
            FROM "At"
            WHERE
                "At"."key" = 'jaws'
            ;
        `);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('User', {
      id: responseCollectionUserIDs['JAWS Bot']
    });
  }
};
