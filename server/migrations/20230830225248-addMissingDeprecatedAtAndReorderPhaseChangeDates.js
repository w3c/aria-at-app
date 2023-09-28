'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(async transaction => {
            // Check for all instances of TestPlanVersions that have "markedAsFinal" reports
            // and in the DRAFT phase, and set those to CANDIDATE (so they can be shown as having
            // reports been generated for them even though they are now deprecated)
            //
            // Eg. 281 (Disclosure Navigation) and
            // 1178 (Radio Group Example Using aria-activedescendant) TestPlanVersions
            const testPlanVersionsToSetToCandidate =
                await queryInterface.sequelize.query(
                    `select "TestPlanVersion".id, phase, "draftPhaseReachedAt", "markedFinalAt"
                         from "TestPlanVersion"
                                  join "TestPlanReport" on "TestPlanVersion".id = "TestPlanReport"."testPlanVersionId"
                         where "markedFinalAt" is not null
                           and phase = 'DRAFT';`,
                    {
                        type: Sequelize.QueryTypes.SELECT,
                        transaction
                    }
                );

            for (const testPlanVersion of testPlanVersionsToSetToCandidate) {
                const candidatePhaseReachedAt = new Date(
                    testPlanVersion.draftPhaseReachedAt
                );

                // Set candidatePhaseReachedAt to draftPhaseReachedAt date (+1 day)
                candidatePhaseReachedAt.setDate(
                    candidatePhaseReachedAt.getDate() + 1
                );

                const recommendedPhaseTargetDate = new Date(
                    candidatePhaseReachedAt
                );
                recommendedPhaseTargetDate.setDate(
                    candidatePhaseReachedAt.getDate() + 180
                );

                await queryInterface.sequelize.query(
                    `update "TestPlanVersion"
                             set "candidatePhaseReachedAt" = ?,
                                 "recommendedPhaseTargetDate" = ?,
                                phase = 'CANDIDATE'
                             where id = ?`,
                    {
                        replacements: [
                            candidatePhaseReachedAt,
                            recommendedPhaseTargetDate,
                            testPlanVersion.id
                        ],
                        transaction
                    }
                );
            }

            // Check for instances of all older TestPlanVersions and deprecate them
            const testPlanVersions = await queryInterface.sequelize.query(
                `select id, directory, "updatedAt", "draftPhaseReachedAt", "candidatePhaseReachedAt", "recommendedPhaseReachedAt", "deprecatedAt"
                       from "TestPlanVersion"
                       order by directory, "updatedAt";`,
                {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            // Group objects by directory
            const groupedData = {};
            for (const testPlanVersion of testPlanVersions) {
                if (!groupedData[testPlanVersion.directory]) {
                    groupedData[testPlanVersion.directory] = [];
                }
                groupedData[testPlanVersion.directory].push(testPlanVersion);
            }

            // Update "deprecatedAt" based on next object's "updatedAt"
            for (const directory in groupedData) {
                const objects = groupedData[directory];
                for (let i = 0; i < objects.length - 1; i++) {
                    objects[i].deprecatedAt = objects[i + 1].updatedAt;
                }
            }

            // Flatten the grouped data back into a single array
            const flattenedTestPlanVersions = Object.values(groupedData).reduce(
                (acc, objects) => acc.concat(objects),
                []
            );

            for (let testPlanVersion of flattenedTestPlanVersions) {
                // Check for the instances where candidatePhaseReachedAt is shown as happening
                // before draftPhaseReachedAt
                if (
                    testPlanVersion.draftPhaseReachedAt &&
                    testPlanVersion.candidatePhaseReachedAt
                ) {
                    let draftPhaseReachedAt = new Date(
                        testPlanVersion.draftPhaseReachedAt
                    );
                    let candidatePhaseReachedAt = new Date(
                        testPlanVersion.candidatePhaseReachedAt
                    );

                    // Update candidatePhaseReachedAt to be the draftPhaseReachedAt date (+1 day)
                    // (because that phase happening before shouldn't be possible)
                    if (candidatePhaseReachedAt < draftPhaseReachedAt) {
                        const newCandidatePhaseReachedAt = new Date(
                            draftPhaseReachedAt
                        );
                        newCandidatePhaseReachedAt.setDate(
                            newCandidatePhaseReachedAt.getDate() + 1
                        );

                        testPlanVersion.candidatePhaseReachedAt =
                            newCandidatePhaseReachedAt;

                        await queryInterface.sequelize.query(
                            `update "TestPlanVersion"
                             set "candidatePhaseReachedAt" = ?
                             where id = ?`,
                            {
                                replacements: [
                                    testPlanVersion.candidatePhaseReachedAt,
                                    testPlanVersion.id
                                ],
                                transaction
                            }
                        );
                    }
                }

                if (testPlanVersion.deprecatedAt) {
                    const deprecatedAt = new Date(testPlanVersion.deprecatedAt);
                    deprecatedAt.setSeconds(deprecatedAt.getSeconds() - 1);

                    // Add deprecatedAt for applicable testPlanVersions
                    await queryInterface.sequelize.query(
                        `update "TestPlanVersion"
                             set "deprecatedAt" = ?,
                                phase = 'DEPRECATED'
                             where id = ?`,
                        {
                            replacements: [deprecatedAt, testPlanVersion.id],
                            transaction
                        }
                    );
                }
            }
        });
    },

    async down(queryInterface) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.sequelize.query(
                `update "TestPlanVersion"
                        set "deprecatedAt" = null;`,
                { transaction }
            );
        });
    }
};
