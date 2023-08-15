'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn('TestPlanReport', 'status', {
                transaction
            });
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanReport',
                'status',
                {
                    type: Sequelize.DataTypes.TEXT,
                    defaultValue: 'DRAFT',
                    allowNull: false
                },
                { transaction }
            );
        });
    }
};
