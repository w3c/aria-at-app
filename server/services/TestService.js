const { exec } = require('child_process');
const db = require('../models/index');
const {
    getTestPlanVersions
} = require('../models/services/TestPlanVersionService');

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
async function importTests(gitSha) {
    if (gitSha) {
        // check if version exists
        let results = await getTestPlanVersions(
            null,
            { gitSha },
            [],
            [],
            [],
            [],
            []
        );
        let versionExists = results.length === 0 ? false : true;
        if (versionExists) {
            return versionExists;
        }
    }
    const { stdout, stderr } = await runImportScript(gitSha);
    return stdout.includes('no errors') && stderr === '';
}

/**
 * Deletes all tests for a user and run
 *
 * @param {object} params, 'userId' and 'runId'
 */
async function deleteTestResultsForRunAndUser({ userId, runId }) {
    return await db.TestResult.destroy({
        where: {
            user_id: userId,
            run_id: runId
        }
    });
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

        // There will always be a serialized form for a complete or partially complete test.
        // Partially complete tests are tests that are skipped.
        const stringifiedSerializedForm = serialized_form
            ? `'${JSON.stringify(serialized_form).replace(/'/g, "''")}'`
            : 'NULL';

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

        // If result is empty, the test was skipped. Add an "incomplete" entry
        else {
            if (serialized_form) {
                statusId = (
                    await db.sequelize.query(`
                     SELECT
                       id
                     FROM
                       test_status
                     WHERE
                       test_status.name = 'incomplete'
                `)
                )[0][0].id;
            } else {
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
            }

            if (!testResultId) {
                testResultId = (
                    await db.sequelize.query(`
                      INSERT INTO
                        test_result(test_id, run_id, user_id, status_id, serialized_form)
                      VALUES
                        (${test_id}, ${run_id}, ${user_id}, ${statusId}, ${stringifiedSerializedForm})
                      RETURNING ID
                     `)
                )[0];
            } else {
                await db.sequelize.query(`
                   UPDATE
                     test_result
                   SET
                     result = NULL,
                     serialized_form = ${stringifiedSerializedForm},
                     status_id = ${statusId}
                   WHERE
                     id = ${testResultId}
                `);
            }
        }

        testResult.id = testResultId;
        if (result) {
            testResult.status = 'complete';
        } else {
            testResult.status = serialized_form ? 'incomplete' : 'skipped';
        }
        return testResult;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

module.exports = {
    deleteTestResultsForRunAndUser,
    importTests,
    saveTestResults
};
