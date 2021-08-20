'use strict';

module.exports = {
    up: (queryInterface /* , Sequelize */) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.bulkDelete('TestPlanRun', {}, { transaction });
            await queryInterface.bulkDelete(
                'TestPlanReport',
                {},
                { transaction }
            );
            await queryInterface.bulkDelete(
                'TestPlanTarget',
                {},
                { transaction }
            );
            await queryInterface.bulkDelete(
                'TestPlanVersion',
                {},
                { transaction }
            );
            await queryInterface.bulkDelete('AtVersion', {}, { transaction });
            await queryInterface.bulkDelete(
                'BrowserVersion',
                {},
                { transaction }
            );
        });
    },

    down: (/*queryInterface, Sequelize */) => {}
};
