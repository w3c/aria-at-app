'use strict';

module.exports = {
    up: async queryInterface => {
        return queryInterface.bulkInsert(
            'CollectionJob',
            [
                { id: '111', status: 'QUEUED' },
                { id: '112', status: 'RUNNING' },
                { id: '113', status: 'COMPLETED' },
                { id: '114', status: 'FAILED' }
            ],
            {}
        );
    },

    down: async queryInterface => {
        return queryInterface.bulkDelete('CollectionJob', null, {});
    }
};
