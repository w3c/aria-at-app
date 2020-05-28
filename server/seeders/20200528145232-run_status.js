'use strict';

module.exports = {
    up: queryInterface => {
        return queryInterface.bulkInsert(
            'run_status',
            [{ name: 'raw' }, { name: 'draft' }, { name: 'final' }],
            {}
        );
    },
    down: queryInterface => {
        return queryInterface.bulkDelete('run_status', null, {});
    }
};
