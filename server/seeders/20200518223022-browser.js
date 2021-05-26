'use strict';

module.exports = {
    up: (queryInterface) => {
        return queryInterface.bulkInsert(
            'Browser',
            [{ name: 'Firefox' }, { name: 'Chrome' }, { name: 'Safari' }],
            {}
        );
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete('Browser', null, {});
    },
};
