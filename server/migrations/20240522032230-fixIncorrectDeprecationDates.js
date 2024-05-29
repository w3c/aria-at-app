'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        return queryInterface.sequelize.transaction(async transaction => {
            const deprecatedRecords = await queryInterface.sequelize.query(
                `
                  SELECT
                    id,
                    phase,
                    "deprecatedAt",
                    "gitSha",
                    directory
                  FROM
                    "TestPlanVersion"
                  WHERE
                    "deprecatedAt" IS NOT NULL
                `,
                { type: queryInterface.sequelize.QueryTypes.SELECT },
                {
                    transaction
                }
            );

            const versionsInRange = await queryInterface.sequelize.query(
                `
              SELECT
                id,
                "draftPhaseReachedAt",
                "candidatePhaseReachedAt",
                "recommendedPhaseReachedAt",
                "updatedAt",
                "gitSha",
                directory
              FROM
                "TestPlanVersion"
              WHERE
                "draftPhaseReachedAt" IS NOT NULL
                OR "candidatePhaseReachedAt" IS NOT NULL
                OR "recommendedPhaseReachedAt" IS NOT NULL;
            `,
                { type: queryInterface.sequelize.QueryTypes.SELECT },
                {
                    transaction
                }
            );

            const versionAndRangeCheck = async (
                record,
                version,
                startRange,
                endRange
            ) => {
                const versionPhaseDates = [
                    version.updatedAt,
                    version.draftPhaseReachedAt,
                    version.candidatePhaseReachedAt,
                    version.recommendedPhaseReachedAt
                ];

                for (let versionPhaseDate of versionPhaseDates) {
                    if (
                        versionPhaseDate &&
                        version.id !== record.id &&
                        version.directory === record.directory &&
                        versionPhaseDate >= startRange &&
                        versionPhaseDate <= endRange
                    ) {
                        const newDeprecatedAt = new Date(
                            new Date(versionPhaseDate.getTime() - 2000)
                        );

                        await queryInterface.sequelize.query(
                            `
                              update "TestPlanVersion"
                              set "deprecatedAt" = '${newDeprecatedAt.toISOString()}'
                              where id = ${record.id}
                              and "gitSha" = '${record.gitSha}'
                              and directory = '${record.directory}'
                            `,
                            {
                                transaction
                            }
                        );

                        // await queryInterface.bulkUpdate(
                        //     'TestPlanVersion',
                        //     { deprecatedAt: newDeprecatedAt },
                        //     { id: record.id },
                        //     { transaction }
                        // );
                    }
                }
            };

            for (let record of deprecatedRecords) {
                const deprecatedAtDate = new Date(record.deprecatedAt);

                const startRange = new Date(
                    deprecatedAtDate.getTime() - 10 * 60000
                );
                const endRange = new Date(
                    deprecatedAtDate.getTime() + 10 * 60000
                );

                for (let version of versionsInRange) {
                    await versionAndRangeCheck(
                        record,
                        version,
                        startRange,
                        endRange
                    );
                }
                // throw new Error('THIS ERROR RAN');
            }
        });
    }
    // async down(queryInterface) {
    //     return queryInterface.sequelize.transaction(async transaction => {
    //         await queryInterface.sequelize.query(
    //             `update "TestPlanVersion"
    //              set "deprecatedAt" = '2023-12-13 22:19:04.298000 +00:00'
    //              where id = 56298
    //                and "gitSha" = 'd9a19f815d0f21194023b1c5919eb3b04d5c1ab7'
    //                and directory = 'command-button'`,
    //             {
    //                 transaction
    //             }
    //         );
    //     });
    // }
};
