'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;

    const versionAndRangeCheck = async (
      deprecatedVersion,
      maybeDeprecatingVersion,
      transaction
    ) => {
      let relevantPhaseDateFound = false;
      let maybeDeprecatingVersionPhaseDate = maybeDeprecatingVersion.updatedAt;

      if (deprecatedVersion.recommendedPhaseReachedAt) {
        if (!maybeDeprecatingVersion.recommendedPhaseReachedAt) return;
        maybeDeprecatingVersionPhaseDate =
          maybeDeprecatingVersion.recommendedPhaseReachedAt;
        relevantPhaseDateFound = true;
      }

      if (
        deprecatedVersion.candidatePhaseReachedAt &&
        !relevantPhaseDateFound
      ) {
        if (!maybeDeprecatingVersion.candidatePhaseReachedAt) return;
        maybeDeprecatingVersionPhaseDate =
          maybeDeprecatingVersion.candidatePhaseReachedAt;
        relevantPhaseDateFound = true;
      }

      if (deprecatedVersion.draftPhaseReachedAt && !relevantPhaseDateFound) {
        if (!maybeDeprecatingVersion.draftPhaseReachedAt) return;
        maybeDeprecatingVersionPhaseDate =
          maybeDeprecatingVersion.draftPhaseReachedAt;
      }

      // Get a 5-minute range around deprecated version to compare to other
      // versions which could have potentially deprecated it based on
      // their phase change dates
      const deprecatedAtDate = new Date(deprecatedVersion.deprecatedAt);
      const startDate = new Date(deprecatedAtDate.getTime() - 5 * MINUTE);
      const endDate = new Date(deprecatedAtDate.getTime() + 5 * MINUTE);

      if (
        maybeDeprecatingVersionPhaseDate.getTime() >= startDate.getTime() &&
        maybeDeprecatingVersionPhaseDate.getTime() <= endDate.getTime()
      ) {
        // Set updated deprecatedAt date as being 2 seconds before
        // whichever dated phase change caused it; exactly how
        // updatePhaseResolver and import-tests is done
        const updatedDeprecatedAt = new Date(
          new Date(maybeDeprecatingVersionPhaseDate.getTime() - 2 * SECOND)
        );

        await queryInterface.sequelize.query(
          `update "TestPlanVersion"
                         set "deprecatedAt" = ?
                         where id = ?
                           and "gitSha" = ?
                           and directory = ?`,
          {
            replacements: [
              updatedDeprecatedAt,
              deprecatedVersion.id,
              deprecatedVersion.gitSha,
              deprecatedVersion.directory
            ],
            transaction
          }
        );
      }
    };

    return queryInterface.sequelize.transaction(async transaction => {
      const testPlanVersions = await queryInterface.sequelize.query(
        `select "id",
                        "phase",
                        "gitSha",
                        "directory",
                        "updatedAt",
                        "draftPhaseReachedAt",
                        "candidatePhaseReachedAt",
                        "recommendedPhaseReachedAt",
                        "deprecatedAt"
                from "TestPlanVersion"`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      const deprecatedVersions = testPlanVersions.filter(
        ({ phase }) => phase === 'DEPRECATED'
      );

      for (let deprecatedVersion of deprecatedVersions) {
        const maybeDeprecatingVersions = testPlanVersions.filter(
          ({ id, directory }) =>
            id !== deprecatedVersion.id &&
            directory === deprecatedVersion.directory
        );

        for (let maybeDeprecatingVersion of maybeDeprecatingVersions) {
          await versionAndRangeCheck(
            deprecatedVersion,
            maybeDeprecatingVersion,
            transaction
          );
        }
      }
    });
  }
};
