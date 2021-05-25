'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
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
                'TestPlanVersion',
                'createdAt',
                'updatedAt',
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
            await queryInterface.addColumn(
                'TestPlanRun',
                'results',
                Sequelize.DataTypes.JSONB,
                { transaction }
            );

            await queryInterface.renameColumn('AtMode', 'at', 'atId', {
                transaction
            });
            await queryInterface.renameColumn('AtVersion', 'at', 'atId', {
                transaction
            });
            await queryInterface.renameColumn(
                'BrowserVersion',
                'browser',
                'browserId',
                { transaction }
            );

            await queryInterface.dropTable('TestResult', { transaction });
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
                'TestPlanVersion',
                'updatedAt',
                'createdAt',
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
            await queryInterface.removeColumn('TestPlanRun', 'results', {
                transaction
            });

            await queryInterface.renameColumn('AtMode', 'atId', 'at', {
                transaction
            });
            await queryInterface.renameColumn('AtVersion', 'atId', 'at', {
                transaction
            });
            await queryInterface.renameColumn(
                'BrowserVersion',
                'browserId',
                'browser',
                { transaction }
            );

            queryInterface.createTable('TestResult', {
                startedAt: {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: Sequelize.DataTypes.NOW
                },
                completedAt: {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: null,
                    allowNull: true
                },
                testPlanRun: { type: Sequelize.DataTypes.INTEGER },
                data: { type: Sequelize.DataTypes.JSONB }
            });
        });
    }
};
