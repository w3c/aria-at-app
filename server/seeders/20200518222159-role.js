'use strict';

module.exports = {
    up: queryInterface => {
        return queryInterface.bulkInsert(
            'role',
            [{ name: 'admin' }, { name: 'tester' }],
            {}
        );
    },

    down: queryInterface => {
        return queryInterface.bulkDelete('role', null, {});
    }
};
