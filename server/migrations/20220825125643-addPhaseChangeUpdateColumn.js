'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanReport',
                'phaseChangeUpdate',
                {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: new Date(),
                    allowNull: false
                },
                { transaction }
            );
        });
    },

    down: queryInterface => {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn(
                'TestPlanReport',
                'phaseChangeUpdate',
                { transaction }
            );
        });
    }
};
