'use strict';

module.exports = {
    async up(queryInterface) {
        // Insert a user
        const user = await queryInterface.bulkInsert(
            'User',
            [
                {
                    id: 9999,
                    username: 'NVDA Bot',
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
        await queryInterface.bulkDelete('User', { id: 9999 });
    }
};
