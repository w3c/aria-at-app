'use strict';

module.exports = {
    up: queryInterface => {
        return queryInterface.bulkInsert(
            'Role',
            [{ name: 'ADMIN' }, { name: 'TESTER' }],
            {}
        );
    },

    down: queryInterface => {
        return queryInterface.bulkDelete('Role', null, {});
    }
};
