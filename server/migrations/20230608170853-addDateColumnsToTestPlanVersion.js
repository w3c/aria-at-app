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
                'draftPhaseReachedAt',
                {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: null,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'TestPlanVersion',
                'candidatePhaseReachedAt',
                {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: null,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'TestPlanVersion',
                'recommendedPhaseReachedAt',
                {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: null,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'TestPlanVersion',
                'recommendedPhaseTargetDate',
                {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: null,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'TestPlanVersion',
                'deprecatedAt',
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
                'draftPhaseReachedAt',
                {
                    transaction
                }
            );
            await queryInterface.removeColumn(
                'TestPlanVersion',
                'candidatePhaseReachedAt',
                {
                    transaction
                }
            );
            await queryInterface.removeColumn(
                'TestPlanVersion',
                'recommendedPhaseReachedAt',
                {
                    transaction
                }
            );
            await queryInterface.removeColumn(
                'TestPlanVersion',
                'recommendedPhaseTargetDate',
                {
                    transaction
                }
            );
            await queryInterface.removeColumn(
                'TestPlanVersion',
                'deprecatedAt',
                {
                    transaction
                }
            );
        });
    }
};
