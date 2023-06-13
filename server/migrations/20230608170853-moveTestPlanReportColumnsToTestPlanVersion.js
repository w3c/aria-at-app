'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanVersion',
                'phase',
                {
                    type: Sequelize.DataTypes.TEXT,
                    allowNull: false,
                    defaultValue: 'DRAFT'
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'TestPlanVersion',
                'candidateStatusReachedAt',
                {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: null,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'TestPlanVersion',
                'recommendedStatusReachedAt',
                {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: null,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'TestPlanVersion',
                'recommendedStatusTargetDate',
                {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: null,
                    allowNull: true
                },
                { transaction }
            );
        });
    },

    async down(queryInterface) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn('TestPlanVersion', 'phase', {
                transaction
            });
            await queryInterface.removeColumn(
                'TestPlanVersion',
                'candidateStatusReachedAt',
                {
                    transaction
                }
            );
            await queryInterface.removeColumn(
                'TestPlanVersion',
                'recommendedStatusReachedAt',
                {
                    transaction
                }
            );
            await queryInterface.removeColumn(
                'TestPlanVersion',
                'recommendedStatusTargetDate',
                {
                    transaction
                }
            );
        });
    }
};
