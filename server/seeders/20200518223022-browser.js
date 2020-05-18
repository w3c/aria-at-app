'use strict';

module.exports = {
    up: queryInterface => {
        return queryInterface.bulkInsert(
            'browser',
            [{ name: 'Firefox' }, { name: 'Chrome' }, { name: 'Safari' }],
            {}
        );
    },

    down: queryInterface => {
        return queryInterface.bulkDelete('browser', null, {});
    }
};
