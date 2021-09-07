'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.changeColumn(
                'TestPlanTarget',
                'atVersion',
                {
                    type: Sequelize.DataTypes.TEXT
                },
                { transaction }
            );

            await queryInterface.changeColumn(
                'TestPlanTarget',
                'browserVersion',
                {
                    type: Sequelize.DataTypes.TEXT
                },
                { transaction }
            );

            await queryInterface.changeColumn(
                'AtVersion',
                'atVersion',
                {
                    type: Sequelize.DataTypes.TEXT,
                    allowNull: false,
                    primaryKey: true
                },
                { transaction }
            );
            await queryInterface.changeColumn(
                'BrowserVersion',
                'browserVersion',
                {
                    type: Sequelize.DataTypes.TEXT,
                    allowNull: false,
                    primaryKey: true
                },
                { transaction }
            );

            await queryInterface.removeConstraint(
                'TestPlanTarget',
                'TestPlanTarget_atVersion_fkey',
                { transaction }
            );
            await queryInterface.removeConstraint(
                'TestPlanTarget',
                'TestPlanTarget_browserVersion_fkey',
                { transaction }
            );

            await queryInterface.removeConstraint(
                'AtVersion',
                'AtVersion_version_key',
                { transaction }
            );
            await queryInterface.removeConstraint(
                'BrowserVersion',
                'BrowserVersion_version_key',
                { transaction }
            );
        });
    },

    down: () => {}
};
