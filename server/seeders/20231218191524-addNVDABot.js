'use strict';

const responseCollectionUser = require('../util/responseCollectionUser');

module.exports = {
    async up(queryInterface) {
        const user = await queryInterface.bulkInsert(
            'User',
            [
                {
                    id: responseCollectionUser.id, // Specified ID for NVDA Bot
                    username: responseCollectionUser.username,
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
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('User', {
            id: responseCollectionUser.id
        });
    }
};
