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
        });
    },

    down: (/*queryInterface, Sequelize */) => {}
};
