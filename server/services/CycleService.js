const db = require('../models/index');
const GithubService = require('./GithubService');
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
        const cycleRow = await db.TestCycle.create({
            name: cycle.name,
            test_version_id: cycle.test_version_id,
            created_user_id: cycle.created_user_id,
            date: new Date()
        });
        let cycleId = cycleRow.dataValues.id;

        for (let run of cycle.runs) {
            const browserVersionRows = await db.BrowserVersion.findOrCreate({
                where: {
                    browser_id: run.browser_id,
                    version: run.browser_version
                }
            });
            const browserVersionId = browserVersionRows[0].dataValues.id;

            const atNameId = (await db.At.findByPk(run.at_id)).dataValues
                .at_name_id;
            const atVersionRow = await db.AtVersion.findOrCreate({
                where: {
                    version: run.at_version,
                    at_name_id: atNameId
                }
            });
            const atVersionId = atVersionRow[0].dataValues.id;

            const runRow = await db.Run.create({
                test_cycle_id: cycleId,
                at_version_id: atVersionId,
                at_id: run.at_id,
                browser_version_id: browserVersionId,
                apg_example_id: run.apg_example_id
            });
            let runId = runRow.dataValues.id;

            if (run.users && run.users.length > 0) {
                UsersService.assignUsersToRuns(run.users, [runId]);
            }
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
 *       runsById: {
 *         id : {
 *           id,
 *           browser_version,
 *           browser_name,
 *           at_key,
 *           at_name,
 *           at_version,
 *           apg_example_directory,
 *           apg_example_name
 *           testers: [user_id, user_id]
 *         }
 *       }
 *     };
 */
async function getAllCycles(id) {
    try {
        let cycleQuery = 'select * from test_cycle';
        if (id) {
            cycleQuery += ` where id = ${id}`;
        }

        let cycles = (await db.sequelize.query(cycleQuery))[0];

        for (let cycle of cycles) {
            let runs = (
                await db.sequelize.query(`
                  select
                    *
                  from
                    run_data
                  where
                    run_data.test_cycle_id = ${cycle.id}
            `)
            )[0];

            let runsById = {};
            for (let run of runs) {
                let users = (
                    await db.sequelize.query(`
                  select
                    user_id
                  from
                    tester_to_run
                  where
                    tester_to_run.run_id = ${run.id}
                `)
                )[0];

                run.testers = users.map(u => u.user_id);

                runsById[run.id] = run;
            }

            cycle.runsById = runsById;
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
            await db.sequelize.query(
                `select id from run where test_cycle_id=${id}`
            )
        )[0];

        for (let run of runs) {
            await db.sequelize.query(
                `delete from tester_to_run where run_id=${run.id}`
            );
            await db.sequelize.query(
                `delete from test_result where run_id=${run.id}`
            );
            await db.sequelize.query(
                `delete from test_issue where run_id=${run.id}`
            );
        }

        await db.sequelize.query(`delete from run where test_cycle_id=${id}`);
        await db.sequelize.query(`delete from test_cycle where id=${id}`);
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
            await db.sequelize.query(`
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
                await db.sequelize.query(`
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
                await db.sequelize.query(`
               select
                 *
               from
                 browser
            `)
            )[0];

            testVersion.supported_ats = ats;
            testVersion.browsers = browsers;

            let examples = (
                await db.sequelize.query(`
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
 * @return {object} - the saved result object (the same data, now with "id" and "status: complete" and "cycle_id")
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
        const {
            test_id,
            run_id,
            user_id,
            result,
            serialized_form
        } = testResult;
        let statusId, testResultId;

        let resultRows = await db.sequelize.query(`
             SELECT
               id
             FROM
               test_result
             WHERE
               test_result.user_id = ${user_id}
               AND test_result.run_id = ${run_id}
               AND test_result.test_id = ${test_id}
        `);

        if (resultRows[0].length) {
            testResultId = resultRows[0][0].id;
        }

        // If a result has been sent, insert or update result row
        if (result) {
            statusId = (
                await db.sequelize.query(`
                 SELECT
                   id
                 FROM
                   test_status
                 WHERE
                   test_status.name = 'complete'
            `)
            )[0][0].id;

            const stringifiedResult = result
                ? `'${JSON.stringify(result).replace(/'/g, "''")}'`
                : 'NULL';

            const stringifiedSerializedForm = result
                ? `'${JSON.stringify(serialized_form).replace(/'/g, "''")}'`
                : 'NULL';

            if (!testResultId) {
                testResultId = (
                    await db.sequelize.query(`
                      INSERT INTO
                        test_result(test_id, run_id, user_id, status_id, result, serialized_form)
                      VALUES
                        (${test_id}, ${run_id}, ${user_id}, ${statusId}, ${stringifiedResult}, ${stringifiedSerializedForm})
                      RETURNING ID
                     `)
                )[0];
            } else {
                await db.sequelize.query(`
                   UPDATE
                     test_result
                   SET
                     result = ${stringifiedResult},
                     serialized_form = ${stringifiedSerializedForm},
                     status_id = ${statusId}
                   WHERE
                     id = ${testResultId}
                `);
            }
        }

        // If result is empty, add a "skipped" entry
        else {
            statusId = (
                await db.sequelize.query(`
                 SELECT
                   id
                 FROM
                   test_status
                 WHERE
                   test_status.name = 'skipped'
            `)
            )[0][0].id;

            if (!testResultId) {
                testResultId = (
                    await db.sequelize.query(`
                      INSERT INTO
                        test_result(test_id, run_id, user_id, status_id)
                      VALUES
                        (${test_id}, ${run_id}, ${user_id}, ${statusId})
                      RETURNING ID
                     `)
                )[0];
            } else {
                await db.sequelize.query(`
                   UPDATE
                     test_result
                   SET
                     result = NULL,
                     serialized_form = NULL,
                     status_id = ${statusId}
                   WHERE
                     id = ${testResultId}
                `);
            }
        }

        let cycle_id = (
            await db.sequelize.query(`
             SELECT
               test_cycle_id as cycle_id
             FROM
               run
             WHERE
               id = ${testResult.run_id}
        `)
        )[0][0].cycle_id;

        testResult.id = testResultId;
        testResult.status = result ? 'complete' : 'skipped';
        testResult.cycle_id = cycle_id;

        return testResult;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Saves a test result and marks the test as "complete"
 *
 * @param {object} run
 * @return {object} - run with saved_status_id
 *
 */
async function saveRunStatus(run) {
    try {
        let { run_status, id } = run;

        const status = await db.RunStatus.findOne({
            attributes: ['id'],
            where: {
                name: run_status
            }
        });

        if (!status) {
            throw new Error(`Status "${run_status}" is not a valid status.`);
        }

        await db.Run.update(
            { run_status_id: status.dataValues.id },
            {
                where: {
                    id
                }
            }
        );

        run.run_status_id = status.dataValues.id;
        return run;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Gets all the runs for a cycle
 *
 * @param {int} cycleId - cycle id
 * @return {object} - list of tests (with save test result data if it exists) keyed by runs
 *
 * @example
 *
 *    {
 *      run_id:[{
 *        id               // test.id
 *        name             // test.name
 *        file             // test.file
 *        execution_order
 *        results : [
 *          user_id: {
 *            id
 *            user_id
 *            status
 *            result
 *          }
 *        ]
 *      }]
 *    }
 */
async function getTestsForRunsForCycle(cycleId) {
    try {
        // We need to get all the runs for which the user has been configured
        // or for which there is an AT that the user can test
        let runs = (
            await db.sequelize.query(`
              select
                *
              from
                run_data
              where
                run_data.test_cycle_id = ${cycleId}
        `)
        )[0];

        let testsForRun = {};

        for (let run of runs) {
            testsForRun[run.id] = [];

            let tests = (
                await db.sequelize.query(`
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
                await db.sequelize.query(`
              select
                test_result.id as id,
                test_result.result as result,
                test_result.serialized_form as serialized_form,
                test_result.test_id as test_id,
                test_result.user_id as user_id,
                test_status.name as status
              from
                test_result,
                test_status
              where
                test_result.status_id = test_status.id
                and test_result.run_id = ${run.id}
            `)
            )[0];

            for (let test of tests) {
                let results = test_results.filter(r => r.test_id === test.id);
                let resultsByUserId = {};
                for (let result of results) {
                    resultsByUserId[result.user_id] = result;
                }
                if (results.length > 0) {
                    test.results = resultsByUserId;
                }
                testsForRun[run.id].push(test);
            }
        }

        return testsForRun;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

async function getIssuesByTestId({ accessToken, test_id }) {
    try {
        const issues = await db.TestIssue.findAll({
            where: {
                test_id
            }
        });

        const results = await GithubService.getIssues({
            accessToken,
            issues
        });

        const response = {
            test_id,
            issues: []
        };

        for (let result of results) {
            response.issues.push(result);
        }

        return response;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

async function createIssue({ accessToken, run_id, test_id, title, body }) {
    try {
        const issue = await GithubService.createIssue({
            accessToken,
            issue: {
                title,
                body
            }
        });

        if (issue) {
            const issue_number = issue.number;
            const record = {
                run_id,
                test_id,
                title,
                body,
                issue_number
            };

            const created = await db.TestIssue.create(record);

            if (created && created.dataValues) {
                return {
                    test_id,
                    issues: [issue]
                };
            }
            throw new Error(`TestIssue was not created, ${created}`);
        }
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
    getTestsForRunsForCycle,
    saveRunStatus,
    saveTestResults,
    getIssuesByTestId,
    createIssue
};
