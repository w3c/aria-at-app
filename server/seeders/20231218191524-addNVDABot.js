'use strict';

const responseCollectionUserIDs = require('../util/responseCollectionUserIDs');

module.exports = {
    async up(queryInterface) {
        const user = await queryInterface.bulkInsert(
            'User',
            [
                {
                    id: responseCollectionUserIDs['NVDA Bot'],
                    username: 'NVDA Bot',
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

        // note to someone copying this seeder to add JAWS, we now need to also
        // link to the UserAts table - see 20240520125142-addBotAts.js
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('User', {
            id: responseCollectionUserIDs['NVDA Bot']
        });
    }
};
