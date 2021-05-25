'use strict';

module.exports = {
    up: (queryInterface /* , Sequelize */) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.renameTable('TestPlan', 'TestPlanVersion', {
                transaction
            });
            await queryInterface.renameColumn(
                'TestPlanReport',
                'testPlan',
                'testPlanVersionId',
                { transaction }
            );
            await queryInterface.renameColumn(
                'TestPlanReport',
                'testPlanTarget',
                'testPlanTargetId',
                { transaction }
            );
            await queryInterface.removeColumn(
                'TestPlanReport',
                'coveragePercent',
                { transaction }
            );
        });
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.renameTable('TestPlanVersion', 'TestPlan', {
                transaction
            });
            await queryInterface.renameColumn(
                'TestPlanReport',
                'testPlanVersionId',
                'testPlan',
                { transaction }
            );
            await queryInterface.renameColumn(
                'TestPlanReport',
                'testPlanTargetId',
                'testPlanTarget',
                { transaction }
            );
            await queryInterface.addColumn(
                'TestPlanReport',
                'coveragePercent',
                Sequelize.DataTypes.NUMERIC,
                { transaction }
            );
        });
    }
};
