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

            // Need to get all the testPlanVersions that don't have testPlanReports attached to them
            // to consider them as just being R&D Complete, but not yet in the DRAFT phase
            const testPlanVersions = await queryInterface.sequelize.query(
                `SELECT
                             "TestPlanVersion".id,
                             "TestPlanVersion"."updatedAt",
                             CASE
                                 WHEN COUNT("TestPlanReport".id) = 0 THEN false
                                 ELSE true
                                 END AS "hasTestPlanReport"
                         FROM "TestPlanVersion"
                                  LEFT JOIN "TestPlanReport" ON "TestPlanVersion".id = "TestPlanReport"."testPlanVersionId"
                         GROUP BY "TestPlanVersion".id;`,
                {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            for (const testPlanVersion of testPlanVersions) {
                const { id, updatedAt, hasTestPlanReport } = testPlanVersion;

                if (hasTestPlanReport)
                    await queryInterface.sequelize.query(
                        `UPDATE "TestPlanVersion" SET "draftPhaseReachedAt" = ? WHERE id = ?`,
                        {
                            replacements: [updatedAt, id],
                            transaction
                        }
                    );
                else
                    await queryInterface.sequelize.query(
                        `UPDATE "TestPlanVersion" SET phase = ? WHERE id = ?`,
                        {
                            replacements: ['RD', id],
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
