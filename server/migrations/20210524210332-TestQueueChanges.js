'use strict';

module.exports = {
    up: async (queryInterface /* , Sequelize */) => {
        await queryInterface.renameTable('TestPlan', 'TestPlanVersion');
        await queryInterface.renameColumn(
            'TestPlanReport',
            'testPlan',
            'testPlanVersionId'
        );
        await queryInterface.renameColumn(
            'TestPlanReport',
            'testPlanTarget',
            'testPlanTargetId'
        );
    },

    down: async (queryInterface /* , Sequelize */) => {
        await queryInterface.renameTable('TestPlanVersion', 'TestPlan');
        await queryInterface.renameColumn(
            'TestPlanReport',
            'testPlanVersionId',
            'testPlan'
        );
        await queryInterface.renameColumn(
            'TestPlanReport',
            'testPlanTargetId',
            'testPlanTarget'
        );
    }
};
