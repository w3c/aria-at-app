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

            const atVersions = await queryInterface.sequelize.query(
                `
                    SELECT
                        id,
                        "atId",
                        "releasedAt"
                    FROM
                        "AtVersion"
                    ORDER BY
                        "releasedAt" ASC
                `,
                { type: Sequelize.QueryTypes.SELECT, transaction }
            );

            const oldAtVersions = {};
            atVersions.forEach(atVersion => {
                if (!oldAtVersions[atVersion.atId]) {
                    oldAtVersions[atVersion.atId] = atVersion.id;
                }
            });

            for (const [atId, atVersionId] of Object.entries(oldAtVersions)) {
                await queryInterface.sequelize.query(
                    `
                        UPDATE
                            "TestPlanReport"
                        SET
                            "minimumAtVersionId" = ?
                        WHERE
                            "atId" = ?
                    `,
                    { replacements: [atVersionId, atId], transaction }
                );
            }
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
