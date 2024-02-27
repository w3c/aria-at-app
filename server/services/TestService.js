const { exec } = require('child_process');
const {
    getTestPlanVersions
} = require('../models/services.deprecated/TestPlanVersionService');

async function runImportScript(git_hash) {
    return new Promise((resolve, reject) => {
        // local dev environments run in the 'server' directory
        let isDevelopmentProcess = process.cwd().includes('server');
        let deployDirectoryPrefix = isDevelopmentProcess ? '..' : '.';
        let importScriptDirectoryPrefix = isDevelopmentProcess
            ? '.'
            : './server';
        let command = `${deployDirectoryPrefix}/deploy/scripts/export-and-exec.sh ${process.env.IMPORT_CONFIG} node ${importScriptDirectoryPrefix}/scripts/import-tests/index.js`;
        if (git_hash) command += ` -c ${git_hash}`;
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
        let results = await getTestPlanVersions({
            where: { gitSha },
            testPlanAttributes: [],
            testPlanReportAttributes: [],
            atAttributes: [],
            browserAttributes: [],
            testPlanRunAttributes: [],
            userAttributes: [],
            transaction: false
        });
        let versionExists = results.length !== 0;
        if (versionExists) return versionExists;
    }
    const { stdout, stderr } = await runImportScript(gitSha);
    return stdout.includes('no errors') && stderr === '';
}

module.exports = {
    importTests
};
