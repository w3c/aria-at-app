BEGIN;
--- DELETE 22 thur 27 FROM run;
DELETE FROM test_issue WHERE run_id IN (22, 23, 24, 25, 26, 27);
DELETE FROM test_result WHERE run_id IN (22, 23, 24, 25, 26, 27);
DELETE FROM tester_to_run WHERE run_id IN (22, 23, 24, 25, 26, 27);
DELETE FROM run WHERE id IN (22, 23, 24, 25, 26, 27);

--- UPDATE all runs to have a run_status_id of 2 (which is in-review);
--- UPDATE all runs to have a test_version_id = 2;
UPDATE run SET run_status_id = 2, test_version_id = 2;

--- Each run needs a browser_version_to_at_version_id
--- This record definately doesn't exist yet and we need to make it the data we
--- need to make it from is in the old database

---aria_at_report_backup=# select id, at_version_id, at_id, browser_version_id from run;
--- id | at_version_id | at_id | browser_version_id
-------+---------------+-------+--------------------
---  4 |             2 |     4 |                  2
---  5 |             2 |     4 |                  2
---  6 |             2 |     4 |                  2
WITH pairs AS (
  INSERT INTO browser_version_to_at_version
  (at_version_id, browser_version_id, "createdAt", "updatedAt")
  VALUES
  (2, 2, NOW(), NOW())
  RETURNING id
)
UPDATE run SET browser_version_to_at_versions_id = (SELECT id FROM pairs)
WHERE id IN (4, 5, 6);
---  7 |             2 |     4 |                  3
---  8 |             2 |     4 |                  3
---  9 |             2 |     4 |                  3
WITH pairs AS (
  INSERT INTO browser_version_to_at_version
  (at_version_id, browser_version_id, "createdAt", "updatedAt")
  VALUES
  (2, 3, NOW(), NOW())
  RETURNING id
)
UPDATE run SET browser_version_to_at_versions_id = (SELECT id FROM pairs)
WHERE id IN (7, 8, 9);

--- 10 |             3 |     5 |                  2
--- 11 |             3 |     5 |                  2
--- 12 |             3 |     5 |                  2
---
WITH pairs AS (
  INSERT INTO browser_version_to_at_version
  (at_version_id, browser_version_id, "createdAt", "updatedAt")
  VALUES
  (3, 2, NOW(), NOW())
  RETURNING id
)
UPDATE run SET browser_version_to_at_versions_id = (SELECT id FROM pairs)
WHERE id IN (10, 11, 12);

---
--- 13 |             3 |     5 |                  3
--- 14 |             3 |     5 |                  3
--- 15 |             3 |     5 |                  3
---
WITH pairs AS (
  INSERT INTO browser_version_to_at_version
  (at_version_id, browser_version_id, "createdAt", "updatedAt")
  VALUES
  (3, 3, NOW(), NOW())
  RETURNING id
)
UPDATE run SET browser_version_to_at_versions_id = (SELECT id FROM pairs)
WHERE id IN (13, 14, 15);

---
--- 16 |             4 |     6 |                  2
--- 17 |             4 |     6 |                  2
--- 18 |             4 |     6 |                  2
---
WITH pairs AS (
  INSERT INTO browser_version_to_at_version
  (at_version_id, browser_version_id, "createdAt", "updatedAt")
  VALUES
  (4, 2, NOW(), NOW())
  RETURNING id
)
UPDATE run SET browser_version_to_at_versions_id = (SELECT id FROM pairs)
WHERE id IN (16, 17, 18);

---
--- 20 |             4 |     6 |                  4
--- 21 |             4 |     6 |                  4
--- 19 |             4 |     6 |                  4
WITH pairs AS (
  INSERT INTO browser_version_to_at_version
  (at_version_id, browser_version_id, "createdAt", "updatedAt")
  VALUES
  (4, 4, NOW(), NOW())
  RETURNING id
)
UPDATE run SET browser_version_to_at_versions_id = (SELECT id FROM pairs)
WHERE id IN (19, 20, 21);


--- It order by updated at by default, This looks nicer
UPDATE run SET run_status_id = 1 WHERE id = 5;

COMMIT;
