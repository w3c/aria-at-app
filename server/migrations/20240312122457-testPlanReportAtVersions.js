'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanReport',
                'exactAtVersionId',
                { type: Sequelize.DataTypes.INTEGER },
                { transaction }
            );

            await queryInterface.addColumn(
                'TestPlanReport',
                'minimumAtVersionId',
                { type: Sequelize.DataTypes.INTEGER },
                { transaction }
            );
        });
    },

    async down(queryInterface /* , Sequelize */) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn(
                'TestPlanReport',
                'exactAtVersionId',
                { transaction }
            );
            await queryInterface.removeColumn(
                'TestPlanReport',
                'minimumAtVersionId',
                { transaction }
            );
        });
    }
};
