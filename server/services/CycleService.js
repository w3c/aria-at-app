const sequelize = global.sequelize;
const UsersService = require('./UsersService');

/**
 * Saves a new test cycle and all the cycle's configurations.
 *
 * @param {object} cycle - cycle object to save
 * @return {object} - the saved cycle as returned by getAllCycles
 *
 * @example
 *
 *     cycle = {
 *       name,
 *       test_version_id,
 *       created_user_id,
 *       runs: [
 *         {
 *           at_version,
 *           browser_version,
 *           at_id,
 *           browser_id,
 *           apg_example_id,
 *           users: [user_id, user_id]
 *         }
 *       ]
 *     };
 */
async function configureCycle(cycle) {
    try {
        let cycleId = (
            await sequelize.query(`
             INSERT INTO
               test_cycle(name, test_version_id, created_user_id, date)
             VALUES
               ('${cycle.name}', ${cycle.test_version_id}, ${cycle.created_user_id}, CURRENT_DATE)
             RETURNING ID
        `)
        )[0][0].id;

        for (let run of cycle.runs) {
            // Get the browser version if it exists, or save it
            let results = (
                await sequelize.query(`
                  select
                    id
                  from
                    browser_version
                  where
                    browser_id = ${run.browser_id} and version = '${run.browser_version}'
            `)
            )[0];
            let browserVersionId = results.length ? results[0].id : undefined;

            if (!browserVersionId) {
                browserVersionId = (
                    await sequelize.query(`
                  INSERT INTO
                    browser_version (browser_id, version)
                  VALUES
                    (${run.browser_id}, '${run.browser_version}')
                  RETURNING id
                `)
                )[0][0].id;
            }

            // Get the at version if it exists, or save it
            results = (
                await sequelize.query(`
                  select
                    at_version.id
                  from
                    at_version,
                    at,
                    at_name
                  where
                    at_name.id = at.at_name_id
                    and at_name.id = at_version.at_name_id
                    and at.id = ${run.at_id}
                    and at_version.version = '${run.at_version}'
            `)
            )[0];
            let atVersionId = results.length ? results[0].id : undefined;

            if (!atVersionId) {
                let atNameId = (
                    await sequelize.query(`
                    select
                      at_name_id
                    from
                      at
                    where
                      at.id = ${run.at_id}
                `)
                )[0][0].at_name_id;

                atVersionId = (
                    await sequelize.query(`
                  INSERT INTO
                    at_version (at_name_id, version)
                  VALUES
                    (${atNameId}, '${run.at_version}')
                  RETURNING id
                `)
                )[0][0].id;
            }

            // Save the runs
            let runId = (
                await sequelize.query(`
                INSERT INTO
                  run(test_cycle_id, at_version_id, at_id, browser_version_id, apg_example_id)
                VALUES
                  (${cycleId}, ${atVersionId}, ${run.at_id}, ${browserVersionId}, ${run.apg_example_id})
                RETURNING ID
            `)
            )[0][0].id;

            UsersService.assignUsersToRun({
                run_id: runId,
                users: run.users
            });
        }

        return (await this.getAllCycles(cycleId))[0];
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Gets all existing test cycles and their configuration.
 *
 * @param {object} id (optional) - if an id is passed, only returns on cycle.
 * @return {array} - all test cycles
 *
 * @example
 *
 *     Returns a list of cycle objects with the following data:
 *     {
 *       id,
 *       name,
 *       test_version_id,
 *       created_user_id,
 *       runs: [
 *         {
 *           id,
 *           browser_version,
 *           browser_name,
 *           at_key,
 *           at_name,
 *           at_version,
 *           apg_example_directory,
 *           apg_example_name
 *           users: [user_id, user_id]
 *         }
 *       ]
 *     };
 */
async function getAllCycles(id) {
    try {
        let cycleQuery = 'select * from test_cycle';
        if (id) {
            cycleQuery += ` where id = ${id}`;
        }

        let cycles = (await sequelize.query(cycleQuery))[0];

        for (let cycle of cycles) {
            let runs = (
                await sequelize.query(`
                  select
                    *
                  from
                    run_data
                  where
                    run_data.test_cycle_id = ${cycle.id}
            `)
            )[0];

            for (let run of runs) {
                let users = (
                    await sequelize.query(`
                  select
                    user_id
                  from
                    tester_to_run
                  where
                    tester_to_run.run_id = ${run.id}
                `)
                )[0];

                run.testers = users.map(u => u.user_id);
            }

            cycle.runs = runs;
        }

        return cycles;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Deletes a cycle and it's configuration, including the runs and testers assigned to runs.
 *
 * @param {object} id - the cycle to delete
 */

async function deleteCycle(id) {
    try {
        let runs = (
            await sequelize.query(
                `select id from run where test_cycle_id=${id}`
            )
        )[0];

        for (let run of runs) {
            await sequelize.query(
                `delete from tester_to_run where run_id=${run.id}`
            );
        }

        await sequelize.query(`delete from run where test_cycle_id=${id}`);
        await sequelize.query(`delete from test_cycle where id=${id}`);
        return;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Gets all the available test versions and necessary data
 *
 * @return {list} - test versions
 *
 * @example
 *
 *     Returns a list of test version objects with the following data:
 *     {
 *       id,
 *       git_repo,
 *       git_tag,
 *       git_hash,
 *       git_commit_msg,
 *       datatime,
 *       supported_ats: [{
 *         at_name_id,
 *         at_name,
 *         at_key,
 *         at_id
 *       }],
 *       apg_examples: [{
 *         directory,
 *         id,
 *         name
 *       }],
 *       browsers: [{
 *         name
 *         id
 *       }]
 *     }
 */
async function getAllTestVersions() {
    try {
        let testVersions = (
            await sequelize.query(`
             select
               *
             from
               test_version
             order by
               datetime DESC;

        `)
        )[0];

        for (let testVersion of testVersions) {
            let ats = (
                await sequelize.query(`
               select
                 at_name.id as at_name_id,
                 at_name.name as at_name,
                 at.key as at_key,
                 at.id as at_id
               from
                 at,
                 at_name
               where
                 at.test_version_id = ${testVersion.id}
                 AND at.at_name_id = at_name.id
            `)
            )[0];

            let browsers = (
                await sequelize.query(`
               select
                 *
               from
                 browser
            `)
            )[0];

            testVersion.supported_ats = ats;
            testVersion.browsers = browsers;

            let examples = (
                await sequelize.query(`
               select
                 id,
                 name,
                 directory
               from
                 apg_example
               where
                 test_version_id = ${testVersion.id}
          `)
            )[0];

            testVersion.apg_examples = examples;
        }

        return testVersions;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Saves a test result and marks the test as "complete"
 *
 * @param {object} result - result object to save
 * @return {object} - the saved result object (the same data, now with "id" and "status: complete")
 *
 * @example
 *
 *     result = {
 *       test_id,
 *       run_id,
 *       user_id,
 *       result
 *     };
 */
async function saveTestResults(testResult) {
    try {
        let statusId = (
            await sequelize.query(`
             SELECT
               id
             FROM
               test_status
             WHERE
               test_status.name = 'complete'
        `)
        )[0][0].id;

        let testResultId = (
            await sequelize.query(`
             INSERT INTO
               test_result(test_id, run_id, user_id, status_id, result)
             VALUES
               (${testResult.test_id}, ${testResult.run_id}, ${
                testResult.user_id
            }, ${statusId}, ${testResult.result ? testResult.result : 'NULL'})
             RETURNING ID
        `)
        )[0];

        testResult.id = testResultId;
        testResult.status = 'complete';
        return testResult;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Gets all the runs that a user is assigned to or can perform within a cycle
 *
 * @param {int} cycleId - cycle id
 * @param {int} userId - user id
 * @return {object} - list of tests (with save test result data if it exists) keyed by runs
 *
 * @example
 *
 *    {
 *      cycle_id: {
 *        run_id: {
 *          tests:[{
 *              id               // test.id
 *              name             // test.name
 *              file             // test.file
 *              execution_order
 *              test_result : {
 *                test_result_id
 *                user_id
 *                status_id
 *                result
 *              }
 *            }]
 *          }
 *        }
 *      }
 *    }
 */
async function getRunsForCycleAndUser(cycleId, userId) {
    try {
        // We need to get all the runs for which the user has been configured
        // or for which there is an AT that the user can test
        let runs = (
            await sequelize.query(`
              select
                *
              from
                run_data
              where
                run_data.test_cycle_id = ${cycleId}
                and run_data.at_name in (
                  select
                    at_name.name
                  from
                    at_name,
                    user_to_at
                  where
                    user_to_at.at_name_id = at_name.id
                    and user_to_at.user_id = ${userId}
                )
        `)
        )[0];

        let runsById = {};

        for (let run of runs) {
            runsById[run.id] = { tests: [] };

            let tests = (
                await sequelize.query(`
              select
                test.id as id,
                name,
                file,
                execution_order
              from
                test,
                test_to_at
              where
                test.apg_example_id = ${run.apg_example_id}
                and test_to_at.test_id = test.id
                and test_to_at.at_id = ${run.at_id}
              order by
                execution_order
            `)
            )[0];

            let test_results = (
                await sequelize.query(`
              select
                test_result.id as id,
                test_result.result as result,
                test_result.test_id as test_id,
                test_status.name as status
              from
                test_result,
                test_status
              where
                test_result.status_id = test_status.id
                and test_result.run_id = ${run.id}
                and test_result.user_id = ${userId}
            `)
            )[0];

            for (let test of tests) {
                let results = test_results.filter(r => r.test_id === test.id);
                if (results.length === 1) {
                    test.result = {
                        id: results[0].id,
                        result: results[0].result,
                        status: results[0].status,
                        user_id: userId
                    };
                }
                runsById[run.id].tests.push(test);
            }
        }

        return runsById;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

module.exports = {
    configureCycle,
    getAllCycles,
    deleteCycle,
    getAllTestVersions,
    getRunsForCycleAndUser,
    saveTestResults
};
