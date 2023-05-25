'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanReport',
                'metrics',
                {
                    type: Sequelize.DataTypes.JSONB,
                    defaultValue: {},
                    allowNull: false
                },
                { transaction }
            );
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn('TestPlanReport', 'metrics', {
                transaction
            });
        });
    }
};
