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
                //   `
                //   SELECT
                //   "title",
                //   "phase",
                //   "testPlanId",
                //   "deprecatedAt",
                //   "draftPhaseReachedAt",
                //   "candidatePhaseReachedAt",
                //   "recommendedPhaseReachedAt",
                //   "deprecatedAt",
                //   "versionString"
                // FROM
                //   "TestPlanVersion"
                // WHERE
                //   "deprecatedAt" IS NOT NULL
                //   AND "title" = 'Command Button Example'
                //   `,
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
                    if (version.draftPhaseReachedAt) {
                        if (
                            version.draftPhaseReachedAt >= startRange &&
                            version.draftPhaseReachedAt <= endRange
                        ) {
                            const newDeprecatedAt = new Date(
                                new Date(
                                    version.draftPhaseReachedAt.getTime()
                                ) - 2000
                            );
                            console.log('newDeprecatedAt', newDeprecatedAt);
                            console.log(
                                'version.draftPhaseReachedAt',
                                version.draftPhaseReachedAt
                            );
                            // throw new Error('THIS ERROR RAN');
                            // console.log(newDeprecatedAt.toISOString())
                            //     await queryInterface.sequelize.query(
                            //         `update "TestPlanVersion"
                            //  set "versionString" = 'GOT IT'
                            //  where id = 62353
                            //    and "gitSha" = '565a87b4111acebdb883d187b581e82c42a73844'
                            //    and directory = 'command-button'`,
                            //         {
                            //             transaction
                            //         }
                            //     );
                            // console.log(record);
                            // console.log('record.id', record.id);
                            // console.log('record.gitSha', record.gitSha);
                            // console.log('record.directory', record.directory);
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
