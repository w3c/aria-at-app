'use strict';

const responseCollectionUserIDs = require('../util/responseCollectionUserIDs');

module.exports = {
    async up(queryInterface) {
        const user = await queryInterface.bulkInsert(
            'User',
            [
                {
                    id: responseCollectionUserIDs['VoiceOver Bot'],
                    username: 'VoiceOver Bot',
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
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('User', {
            id: responseCollectionUserIDs['VoiceOver Bot']
        });
    }
};
