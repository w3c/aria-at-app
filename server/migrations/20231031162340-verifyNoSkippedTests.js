'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface /* , Sequelize */) {
    return queryInterface.sequelize.transaction(async transaction => {
      const [rows] = await queryInterface.sequelize.query(
        `
                    SELECT
                        "TestPlanReport".id,
                        "TestPlanReport"."atId",
                        "TestPlanRun"."testResults",
                        "TestPlanVersion".tests
                    FROM
                        "TestPlanReport"
                        INNER JOIN "TestPlanVersion" ON "TestPlanVersion".id = "TestPlanReport"."testPlanVersionId"
                        INNER JOIN "TestPlanRun" ON "TestPlanReport".id = "TestPlanRun"."testPlanReportId"
                    WHERE
                        "TestPlanReport"."markedFinalAt" IS NOT NULL
                `,
        { transaction }
      );

      const dataById = {};
      rows.forEach(({ id, atId, testResults, tests }) => {
        if (dataById[id]) {
          dataById[id].runLengths.push(testResults.length);
        } else {
          const runnableTestsLength = tests.filter(test =>
            test.atIds.includes(atId)
          ).length;
          dataById[id] = {
            id,
            runnableTestsLength,
            runLengths: [testResults.length]
          };
        }
      });

      for (const data of Object.values(dataById)) {
        const isComplete = data.runLengths.every(
          runLength => runLength === data.runnableTestsLength
        );
        if (!isComplete) {
          console.info(`Found incomplete report ${data.id}`); // eslint-disable-line
          // Since final test plan reports can
          // no longer have skipped tests, we should
          // move them to the test queue where incomplete
          // runs are still supported.
          await queryInterface.sequelize.query(
            `
                            UPDATE "TestPlanReport" SET "markedFinalAt" = NULL WHERE id = ?
                        `,
            {
              replacements: [data.id],
              transaction
            }
          );
        }
      }
    });
  }
};
