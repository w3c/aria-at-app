'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      const testPlanVersions = await queryInterface.sequelize.query(
        `select id, "candidatePhaseReachedAt", "recommendedPhaseTargetDate", directory
                     from "TestPlanVersion"
                     where "candidatePhaseReachedAt" is not null
                     order by "candidatePhaseReachedAt"`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      const testPlanVersionsByDirectory = {};
      for (const testPlanVersion of testPlanVersions) {
        const { directory } = testPlanVersion;

        if (!testPlanVersionsByDirectory[directory])
          testPlanVersionsByDirectory[directory] = [testPlanVersion];
        else testPlanVersionsByDirectory[directory].push(testPlanVersion);
      }

      for (const directory of Object.keys(testPlanVersionsByDirectory)) {
        // No need to update since only that TestPlanVersion exists in CANDIDATE
        if (directory.length === 1) continue;

        // Already pre sorted to have the earliest candidatePhaseStart date; works because
        // no RECOMMENDED TestPlanVersions currently exist
        const [firstTestPlanVersion, ...rest] =
          testPlanVersionsByDirectory[directory];

        for (const restTestPlanVersion of rest) {
          await queryInterface.sequelize.query(
            `update "TestPlanVersion"
                         set "recommendedPhaseTargetDate" = ?
                         where id = ?`,
            {
              replacements: [
                firstTestPlanVersion.recommendedPhaseTargetDate,
                restTestPlanVersion.id
              ],
              transaction
            }
          );
        }
      }
    });
  }
};
