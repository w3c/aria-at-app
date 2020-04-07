CREATE VIEW run_data AS
SELECT
  run.id AS id,
  run.test_cycle_id AS test_cycle_id,
  browser_version.version AS browser_version,
  browser.name AS browser_name,
  at.key AS at_key,
  at_name.name AS at_name,
  at_version.version AS at_version,
  apg_example.directory AS apg_example_directory,
  apg_example.name AS apg_example_name
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
