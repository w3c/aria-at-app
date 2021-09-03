'use strict';

const { At } = require('../models');

module.exports = {
    up: async queryInterface => {
        if ((await At.findAll()).length) return;
        return queryInterface.bulkInsert(
            'At',
            [
                { name: 'JAWS' },
                { name: 'NVDA' },
                { name: 'VoiceOver for macOS' }
            ],
            {}
        );
    },

    down: async queryInterface => {
        await queryInterface.bulkDelete('At', null, {});
    }
};
