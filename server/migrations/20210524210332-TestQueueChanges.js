'use strict';

module.exports = {
    up: (queryInterface /* , Sequelize */) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.renameTable('TestPlan', 'TestPlanVersion', {
                transaction
            });

            await queryInterface.renameColumn(
                'TestPlanVersion',
                'publishStatus',
                'status',
                { transaction }
            );
            await queryInterface.renameColumn(
                'TestPlanVersion',
                'sourceGitCommitHash',
                'gitSha',
                { transaction }
            );
            await queryInterface.renameColumn(
                'TestPlanVersion',
                'sourceGitCommitMessage',
                'gitMessage',
                { transaction }
            );

            await queryInterface.renameColumn(
                'TestPlanReport',
                'publishStatus',
                'status',
                { transaction }
            );
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

            await queryInterface.renameColumn(
                'TestPlanRun',
                'tester',
                'testerUserId',
                { transaction }
            );
            await queryInterface.renameColumn(
                'TestPlanRun',
                'testPlanReport',
                'testPlanReportId',
                { transaction }
            );
            await queryInterface.removeColumn(
                'TestPlanRun',
                'isManuallyTested',
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
                'TestPlan',
                'status',
                'publishStatus',
                { transaction }
            );
            await queryInterface.renameColumn(
                'TestPlan',
                'gitSha',
                'sourceGitCommitHash',
                { transaction }
            );
            await queryInterface.renameColumn(
                'TestPlan',
                'gitMessage',
                'sourceGitCommitMessage',
                { transaction }
            );

            await queryInterface.renameColumn(
                'TestPlanReport',
                'status',
                'publishStatus',
                { transaction }
            );
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

            await queryInterface.renameColumn(
                'TestPlanRun',
                'testerUserId',
                'tester',
                { transaction }
            );
            await queryInterface.renameColumn(
                'TestPlanRun',
                'testPlanReportId',
                'testPlanReport',
                { transaction }
            );
            await queryInterface.addColumn(
                'TestPlanRun',
                'isManuallyTested',
                Sequelize.DataTypes.BOOLEAN,
                { transaction }
            );
        });
    }
};
