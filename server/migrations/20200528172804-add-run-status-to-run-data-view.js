'use strict';

let updateViewQuery = `
CREATE OR REPLACE VIEW run_data AS
SELECT
  r.id AS id,
  r.test_cycle_id AS test_cycle_id,
  browser_version.version AS browser_version,
  browser.name AS browser_name,
  browser.id AS browser_id,
  at.key AS at_key,
  at.id AS at_id,
  at_name.name AS at_name,
  at_name.id AS at_name_id,
  at_version.version AS at_version,
  apg_example.directory AS apg_example_directory,
  apg_example.name AS apg_example_name,
  apg_example.id AS apg_example_id,
  r.run_status_id AS run_status_id,
  r.run_status AS run_status
FROM
  (
    SELECT
      run.id as id,
      run.test_cycle_id as test_cycle_id,
      run.browser_version_id,
      run.at_id,
      run.at_version_id,
      run.apg_example_id,
      run_status.name as run_status,
      run_status.id as run_status_id
    FROM
      run
    LEFT JOIN run_status ON run_status.id = run.run_status_id
  ) as r,
  browser_version,
  browser,
  at,
  at_name,
  at_version,
  apg_example
WHERE
  r.browser_version_id = browser_version.id
  AND browser_version.browser_id = browser.id
  AND r.at_id = at.id
  AND at.at_name_id = at_name.id
  AND r.at_version_id = at_version.id
  AND r.apg_example_id = apg_example.id
;
`
let originalViewQuery = `
CREATE OR REPLACE VIEW run_data AS
SELECT
  run.id AS id,
  run.test_cycle_id AS test_cycle_id,
  browser_version.version AS browser_version,
  browser.name AS browser_name,
  browser.id AS browser_id,
  at.key AS at_key,
  at.id AS at_id,
  at_name.name AS at_name,
  at_name.id AS at_name_id,
  at_version.version AS at_version,
  apg_example.directory AS apg_example_directory,
  apg_example.name AS apg_example_name,
  apg_example.id AS apg_example_id
FROM
  run,
  browser_version,
  browser,
  at,
  at_name,
  at_version,
  apg_example
WHERE
  run.browser_version_id = browser_version.id
  AND browser_version.browser_id = browser.id
  AND run.at_id = at.id
  AND at.at_name_id = at_name.id
  AND run.at_version_id = at_version.id
  AND run.apg_example_id = apg_example.id
;
`

module.exports = {
    up: (queryInterface) => {
        return queryInterface.sequelize.query(updateViewQuery)

    },
    async down(queryInterface) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.sequelize.query(`DROP VIEW IF EXISTS run_data`);
            await queryInterface.sequelize.query(originalViewQuery);
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};
