'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.changeColumn(
                'TestPlanVersion',
                'phase',
                {
                    type: Sequelize.DataTypes.TEXT,
                    allowNull: false,
                    defaultValue: 'RD'
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

            const testPlanVersions = await queryInterface.sequelize.query(
                `SELECT id, "updatedAt" FROM "TestPlanVersion"`,
                {
                    transaction
                }
            );
            const testPlanVersionsData = testPlanVersions[0];

            for (const testPlanVersion of testPlanVersionsData) {
                const { id, updatedAt } = testPlanVersion;

                await queryInterface.sequelize.query(
                    `UPDATE "TestPlanVersion" SET "draftPhaseReachedAt" = ? WHERE id = ?`,
                    {
                        replacements: [updatedAt, id],
                        transaction
                    }
                );
            }

            await queryInterface.addColumn(
                'TestPlanVersion',
                'archivedAtDate',
                {
                    type: Sequelize.DataTypes.DATE,
                    defaultValue: null,
                    allowNull: true
                },
                { transaction }
            );
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.changeColumn(
                'TestPlanVersion',
                'phase',
                {
                    type: Sequelize.DataTypes.TEXT,
                    allowNull: false,
                    defaultValue: 'DRAFT'
                },
                { transaction }
            );

            await queryInterface.removeColumn(
                'TestPlanVersion',
                'draftPhaseReachedAt',
                {
                    transaction
                }
            );
            await queryInterface.removeColumn(
                'TestPlanVersion',
                'archivedAtDate',
                {
                    transaction
                }
            );
        });
    }
};
