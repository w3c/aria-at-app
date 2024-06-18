'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      const modifyPrioritiesInTable = async () => {
        const testPlanVersions = await queryInterface.sequelize.query(
          // This query is returning tests that have any assertions that
          // have a priority value of REQUIRED or OPTIONAL.
          `
                    SELECT
                    id,
                    tests
                  FROM
                    "TestPlanVersion"
                  WHERE
                    EXISTS (
                      SELECT
                        1
                      FROM
                        jsonb_array_elements(tests) AS test,
                        jsonb_array_elements(test -> 'assertions') AS assertion
                      WHERE
                        assertion ->> 'priority' = 'REQUIRED'
                        OR assertion ->> 'priority' = 'OPTIONAL'
                    )`,
          {
            type: Sequelize.QueryTypes.SELECT,
            transaction
          }
        );

        await Promise.all(
          testPlanVersions.map(async ({ id, tests }) => {
            const updatedTests = JSON.stringify(
              tests.map(test => {
                return {
                  ...test,
                  assertions: test.assertions.map(assertion => {
                    if (assertion.priority === 'REQUIRED') {
                      assertion.priority = 'MUST';
                    } else if (assertion.priority === 'OPTIONAL') {
                      assertion.priority = 'SHOULD';
                    }

                    return {
                      ...assertion
                    };
                  })
                };
              })
            );
            await queryInterface.sequelize.query(
              `
                                UPDATE
                                    "TestPlanVersion"
                                SET
                                    tests = ?
                                WHERE
                                    id = ?
                            `,
              { replacements: [updatedTests, id], transaction }
            );
          })
        );
      };
      await modifyPrioritiesInTable();
    });
  },
  down: async () => {}
};
