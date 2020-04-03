const sequelize = global.sequelize;

class CycleService {

    /*
     * Expects:
     *   cycle = {
     *     name: cycle.name,
     *     test_version_id: test_version_id,
     *     created_user_id: user.idx
     *     runs: [
     *       {
     *         at_version,
     *         browser_version,
     *         at_id,
     *         browser_id,
     *         apg_example_id,
     *         users: [user_id, user_id]
     *       }
     *     ]
     *   }
     * Returns:
     *   The saved cycle, with ids, but now "user" list in the runs.   // QUESITON: how should we get the user list?
     * }
     */
    static async configureCycle(cycle) {
        try {
            let cycleId = (await sequelize.query(`
                 INSERT INTO
                   test_cycle(name, test_version_id, created_user_id, date)
                 VALUES
                   ('${cycle.name}', ${cycle.test_version_id}, ${cycle.created_user_id}, CURRENT_DATE)
                 RETURNING ID
            `))[0][0].id;

            for (let run of cycle.runs) {

                // Get the browser version if it exists, or save it
                let results = (await sequelize.query(`
                      select
                        id
                      from
                        browser_version
                      where
                        browser_id = ${run.browser_id} and version = '${run.browser_version}'
                `))[0];
                let browserVersionId = results.length ? results[0].id : undefined;

                if (!browserVersionId) {
                    browserVersionId = (await sequelize.query(`
                      INSERT INTO
                        browser_version (browser_id, version)
                      VALUES
                        (${run.browser_id}, '${run.browser_version}')
                      RETURNING id
                    `))[0][0].id;
                }

                // Get the at version if it exists, or save it
                results = (await sequelize.query(`
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
                `))[0];
                let atVersionId = results.length ? results[0].id : undefined;

                if (!atVersionId) {
                    let atNameId = (await sequelize.query(`
                        select
                          at_name_id
                        from
                          at
                        where
                          at.id = ${run.at_id}
                    `))[0][0].at_name_id;

                    atVersionId = (await sequelize.query(`
                      INSERT INTO
                        at_version (at_name_id, version)
                      VALUES
                        (${atNameId}, '${run.at_version}')
                      RETURNING id
                    `))[0][0].id;
                }


                // Save the runs
                let runId = (await sequelize.query(`
                    INSERT INTO
                      run(test_cycle_id, at_version_id, at_id, browser_version_id, apg_example_id)
                    VALUES
                      (${cycleId}, ${atVersionId}, ${run.at_id}, ${browserVersionId}, ${run.apg_example_id})
                    RETURNING ID
                `))[0][0].id;


                // QUESTION: I should somehow link into the model here. Should I call the model servie from the controller?
                // Or should I call the models here?
                for (let userId of run.users) {
                    await sequelize.query(`
                        INSERT INTO
                          tester_to_run(user_id, run_id)
                        VALUES
                          (${userId}, ${runId})
                        RETURNING ID
                    `);
                }
            }

            return (await this.getAllCycles(cycleId))[0];

        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    }


    /*
     * Returns:
     *   {
     *     id: cycle.id
     *     name: cycle.name,
     *     test_version_id: test_version_id,
     *     created_user_id: user.id
     *     runs: [
     *       {
     *         id,
     *         browser_version,
     *         browser_name,
     *         at_key,
     *         at_name,
     *         at_version,
     *         apg_example_directory,
     *         apg_example_name
     *       }
     *     ]
     *   }
     */
    static async getAllCycles(id) {
        try {
            let cycleQuery = 'select * from test_cycle';
            if (id) {
                cycleQuery += ` where id = ${id}`;
            }

            let cycles = (await sequelize.query(cycleQuery))[0];

            for (let cycle of cycles) {

                // QUESTION: Should this be a view?
                let runs = (await sequelize.query(`
                      select
                        run.id as id,
                        browser_version.version as browser_version,
                        browser.name as browser_name,
                        at.key as at_key,
                        at_name.name as at_name,
                        at_version.version as at_version,
                        apg_example.directory as apg_example_directory,
                        apg_example.name as apg_example_name
                      from
                        run,
                        browser_version,
                        browser,
                        at,
                        at_name,
                        at_version,
                        apg_example
                      where
                        run.test_cycle_id = ${cycle.id}
                        and run.browser_version_id = browser_version.id
                        and browser_version.browser_id = browser.id
                        and run.at_id = at.id
                        and at.at_name_id = at_name.id
                        and run.at_version_id = at_version.id
                        and run.apg_example_id = apg_example.id
                `))[0];

                cycle.runs = runs;
            }

            return cycles;

        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    }

    /*
     * Expects: cycle id
     */
    static async deleteCycle(id) {
        try {
            let runs = (await sequelize.query(`select id from run where test_cycle_id=${id}`))[0];

            for (let run of runs) {
                await sequelize.query(`delete from tester_to_run where run_id=${run.id}`);
            }

            await sequelize.query(`delete from run where test_cycle_id=${id}`);
            await sequelize.query(`delete from test_cycle where id=${id}`);
            return;
        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    }

    /*
     * Returns:
     *   [
     *     {
     *       id,
     *       git_repo,
     *       git_tag,
     *       git_hash,
     *       git_commit_msg,
     *       datatime,
     *       supported_ats: [
     *         at_name_id,
     *         at_name,
     *         at_key,
     *         at_id
     *       ]
     *     },
     *     ...
     *   ]
     */
    static async getAllTestVersions() {
        try {
            let testVersions = (await sequelize.query(`
                 select
                   *
                 from
                   test_version
            `))[0];

            for (let testVersion of testVersions) {
              let ats = (await sequelize.query(`
                   select
                     at_name.id as at_name_id,
                     at_name.name as at_name,
                     at.key as at_key,
                     at.id as at_id
                   from
                     test_to_at,
                     at,
                     at_name
                   where
                     test_to_at.test_id = ${testVersion.id}
                     AND test_to_at.at_id = at.id
                     AND at.at_name_id = at_name.id
              `))[0];

              testVersion.supported_ats = ats;

              let examples = (await sequelize.query(`
                   select
                     id,
                     name,
                     directory
                   from
                     apg_example
                   where
                     test_version_id = ${testVersion.id}
              `))[0];

              testVersion.apg_examples = examples;

            }

            return testVersions;

        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    }

}

module.exports = CycleService;
