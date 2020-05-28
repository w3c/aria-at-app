'use strict';

module.exports = {
    up: queryInterface => {
        return queryInterface.bulkInsert(
            'run_status',
            [{ name: 'incomplete' }, { name: 'draft' }, { name: 'final' }],
            {}
        );
    },
    down: queryInterface => {
        return queryInterface.bulkDelete('run_status', null, {});
    }
};
