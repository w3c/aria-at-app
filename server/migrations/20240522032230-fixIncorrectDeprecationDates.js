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
            `
            );

            for (let record of deprecatedRecords) {
                const startRange = new Date(
                    new Date(record.deprecatedAt.getTime()) - 10 * 60000
                );
                const endRange = new Date(
                    new Date(record.deprecatedAt.getTime()) + 10 * 60000
                );
                // console.log('startRange', startRange);
                // console.log('record.deprecatedAt', record.deprecatedAt);
                // console.log('endRange', endRange);
                // console.log(versionsInRange[0]);

                for (let version of versionsInRange[0]) {
                    if (version.updatedAt) {
                        if (
                            version.directory === record.directory &&
                            version.updatedAt >= startRange &&
                            version.updatedAt <= endRange
                        ) {
                            const newDeprecatedAt = new Date(
                                new Date(version.updatedAt.getTime()) - 2000
                            );

                            await queryInterface.sequelize.query(
                                `update "TestPlanVersion"
                          set "deprecatedAt" = '${newDeprecatedAt.toISOString()}'
                       where id = ${record.id}
                         and "gitSha" = '${record.gitSha}'
                         and directory = '${record.directory}'`,
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
                    if (version.draftPhaseReachedAt) {
                        if (
                            version.directory === record.directory &&
                            version.draftPhaseReachedAt >= startRange &&
                            version.draftPhaseReachedAt <= endRange
                        ) {
                            const newDeprecatedAt = new Date(
                                new Date(
                                    version.draftPhaseReachedAt.getTime()
                                ) - 2000
                            );
                            console.log('version.directory', newDeprecatedAt);
                            console.log('record.directory', version.draftPhaseReachedAt);
                            // throw new Error('THIS ERROR RAN');

                            await queryInterface.sequelize.query(
                                `update "TestPlanVersion"
                               set "deprecatedAt" = '${newDeprecatedAt.toISOString()}'
                               where id = ${record.id}
                                 and "gitSha" = '${record.gitSha}'
                                 and directory = '${record.directory}'`,
                                {
                                    transaction
                                }
                            );
                            // console.log(2)
                            // await queryInterface.bulkUpdate(
                            //     'TestPlanVersion',
                            //     { deprecatedAt: newDeprecatedAt },
                            //     { id: record.id },
                            //     { transaction }
                            // );
                            // console.log(version.draftPhaseReachedAt)
                        }
                    }
                    if (version.candidatePhaseReachedAt) {
                        if (
                          version.directory === record.directory &&
                            version.candidatePhaseReachedAt >= startRange &&
                            version.candidatePhaseReachedAt <= endRange
                        ) {
                            const newDeprecatedAt = new Date(
                                new Date(
                                    version.candidatePhaseReachedAt.getTime()
                                ) - 2000
                            );
                            await queryInterface.sequelize.query(
                                `update "TestPlanVersion"
                                set "deprecatedAt" = '${newDeprecatedAt.toISOString()}'
                             where id = ${record.id}
                               and "gitSha" = '${record.gitSha}'
                               and directory = '${record.directory}'`,
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
                    if (version.recommendedPhaseReachedAt) {
                        if (
                          version.directory === record.directory &&
                            version.recommendedPhaseReachedAt >= startRange &&
                            version.recommendedPhaseReachedAt <= endRange
                        ) {
                            const newDeprecatedAt = new Date(
                                new Date(
                                    version.recommendedPhaseReachedAt.getTime()
                                ) - 2000
                            );

                            await queryInterface.sequelize.query(
                                `update "TestPlanVersion"
                                set "deprecatedAt" = '${newDeprecatedAt.toISOString()}'
                             where id = ${record.id}
                               and "gitSha" = '${record.gitSha}'
                               and directory = '${record.directory}'`,
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
                }
            }

            // console.log('versionsInRange', versionsInRange[0]);
            // console.log('deprecatedRecords', deprecatedRecords);
            // console.log('check', check);
            // console.log("date2", date2);
            // throw new Error('THIS ERROR RAN');
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
