'use strict';

module.exports = {
    up: queryInterface => {
        return queryInterface.bulkInsert(
            'Role',
            [{ name: 'admin' }, { name: 'tester' }],
            {}
        );
    },

    down: queryInterface => {
        return queryInterface.bulkDelete('Role', null, {});
    }
};
