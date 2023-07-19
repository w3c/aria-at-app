'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanReport',
                'approvedAt',
                {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: null,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.sequelize.query(
                `UPDATE "TestPlanReport"
                        SET "approvedAt" = "candidateStatusReachedAt"
                        WHERE "candidateStatusReachedAt" IS NOT NULL`,
                {
                    transaction
                }
            );

            await queryInterface.removeColumn(
                'TestPlanReport',
                'candidateStatusReachedAt',
                {
                    transaction
                }
            );
            await queryInterface.removeColumn(
                'TestPlanReport',
                'recommendedStatusReachedAt',
                {
                    transaction
                }
            );
            await queryInterface.removeColumn(
                'TestPlanReport',
                'recommendedStatusTargetDate',
                {
                    transaction
                }
            );
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn('TestPlanReport', 'approvedAt', {
                transaction
            });

            await queryInterface.addColumn(
                'TestPlanReport',
                'candidateStatusReachedAt',
                {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: null,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'TestPlanReport',
                'recommendedStatusReachedAt',
                {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: null,
                    allowNull: true
                },
                { transaction }
            );

            await queryInterface.addColumn(
                'TestPlanReport',
                'recommendedStatusTargetDate',
                {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: null,
                    allowNull: true
                },
                { transaction }
            );
        });
    }
};
