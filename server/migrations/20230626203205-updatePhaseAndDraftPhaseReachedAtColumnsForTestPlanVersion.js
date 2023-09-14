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

                if (hasTestPlanReport) {
                    const draftPhaseReachedAt = new Date(updatedAt);
                    draftPhaseReachedAt.setSeconds(
                        // Set draftPhaseReachedAt to happen 60 seconds after updatedAt for general
                        // 'correctness' and to help with any app sorts
                        draftPhaseReachedAt.getSeconds() + 60
                    );
                    await queryInterface.sequelize.query(
                        `UPDATE "TestPlanVersion" SET "draftPhaseReachedAt" = ? WHERE id = ?`,
                        {
                            replacements: [draftPhaseReachedAt, id],
                            transaction
                        }
                    );
                } else
                    await queryInterface.sequelize.query(
                        `UPDATE "TestPlanVersion" SET phase = ? WHERE id = ?`,
                        {
                            replacements: ['RD', id],
                            transaction
                        }
                    );
            }
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
        });
    }
};
