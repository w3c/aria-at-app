'use strict';

module.exports = {
    up: async (queryInterface /* , Sequelize */) => {
        const jawsAtId = 1;
        const nvdaAtId = 2;
        const voiceOverAtId = 3;

        const firefoxBrowserId = 1;
        const chromeBrowserId = 2;
        const safariBrowserId = 3;
        return queryInterface.bulkInsert(
            'AtBrowsers',
            [
                { atId: jawsAtId, browserId: firefoxBrowserId },
                { atId: jawsAtId, browserId: chromeBrowserId },
                { atId: nvdaAtId, browserId: firefoxBrowserId },
                { atId: nvdaAtId, browserId: chromeBrowserId },
                { atId: voiceOverAtId, browserId: safariBrowserId },
                { atId: voiceOverAtId, browserId: firefoxBrowserId },
                { atId: voiceOverAtId, browserId: chromeBrowserId }
            ],
            {}
        );
    },

    down: async (queryInterface /* , Sequelize */) => {
        await queryInterface.dropTable('AtBrowsers');
    }
};
