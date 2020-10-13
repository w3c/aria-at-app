const { exec } = require('child_process');
const db = require('../models/index');
const GithubService = require('./GithubService');

async function runImportScript(git_hash) {
    return new Promise((resolve, reject) => {
        // local dev environments run in the 'server' directory
        let isDevelopmentProcess = process.cwd().includes('server');
        let deployDirectoryPrefix = isDevelopmentProcess ? '..' : '.';
        let importScriptDirectoryPrefix = isDevelopmentProcess
            ? '.'
            : './server';
        let command = `${deployDirectoryPrefix}/deploy/scripts/export-and-exec.sh ${process.env.IMPORT_CONFIG} node ${importScriptDirectoryPrefix}/scripts/import-tests/index.js`;
        if (git_hash) {
            command += ` -c ${git_hash}`;
        }
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            resolve({ stdout, stderr });
        });
    });
}

/**
 * Functions that use importTests should be wrapped
 * in a try/catch in case the import script fails
 */
async function importTests(git_hash) {
    if (git_hash) {
        // check if version exists
        let results = await db.TestVersion.findAll({ where: { git_hash } });
        let versionExists = results.length === 0 ? false : true;
        if (versionExists) {
            return versionExists;
        }
    }
    const { stdout, stderr } = await runImportScript(git_hash);
    return stdout.includes('no errors') && stderr === '';
}

/**
 * Saves a test result and marks the test as "complete"
 *
 * @param {object} params
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

        testResult.id = testResultId;
        testResult.status = result ? 'complete' : 'skipped';

        return testResult;
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

module.exports = {
    importTests,
    saveTestResults,
    getIssuesByTestId
};
