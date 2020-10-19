'use strict';
const db = require('../models');

const getLatestTestVersion = async () =>
    await db.TestVersion.findOne({
        order: [['datetime', 'DESC']]
    });

module.exports = {
    up: async queryInterface => {
        const latestTestVersion = await getLatestTestVersion();
        return queryInterface.bulkUpdate(
            'test_version',
            { active: true },
            { id: latestTestVersion.id }
        );
    },

    down: async queryInterface => {
        const latestTestVersion = await getLatestTestVersion();
        return queryInterface.bulkUpdate(
            'test_version',
            { active: false },
            { id: latestTestVersion.id }
        );
    }
};
