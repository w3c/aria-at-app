'use strict';

module.exports = {
    up: async (queryInterface /* , Sequelize */) => {
        await queryInterface.renameTable('TestPlan', 'TestPlanVersion');
        await queryInterface.renameColumn(
            'TestPlanReport',
            'TestPlan',
            'TestPlanVersion'
        );
    },

    down: async (queryInterface /* , Sequelize */) => {
        await queryInterface.renameTable('TestPlanVersion', 'TestPlan');
        await queryInterface.renameColumn(
            'TestPlanReport',
            'TestPlanVersion',
            'TestPlan'
        );
    }
};
