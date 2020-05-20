'use strict';

module.exports = {
    up: queryInterface => {
        return queryInterface.bulkInsert(
            'test_status',
            [{ name: 'skipped' }, { name: 'incomplete' }, { name: 'complete' }],
            {}
        );
    },

    down: queryInterface => {
        return queryInterface.bulkDelete('test_status', null, {});
    }
};
