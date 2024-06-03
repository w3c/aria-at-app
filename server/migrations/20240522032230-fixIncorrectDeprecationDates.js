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
                        record.draftPhaseReachedAt === null &&
                        versionPhaseDate !== version.updatedAt
                    ) {
                        continue;
                    }
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
                    }
                }
            };

            for (let record of deprecatedRecords) {
                const deprecatedAtDate = new Date(record.deprecatedAt);

                const startRange = new Date(
                    deprecatedAtDate.getTime() - 5 * 60000
                );
                const endRange = new Date(
                    deprecatedAtDate.getTime() + 5 * 60000
                );

                for (let version of versionsInRange) {
                    await versionAndRangeCheck(
                        record,
                        version,
                        startRange,
                        endRange
                    );
                }
            }
        });
    }
};
