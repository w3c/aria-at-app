const { exec } = require('child_process');
const db = require('../models/index');

async function runImportScript(git_hash) {
    return new Promise((resolve, reject) => {
        // local dev environments run in the 'server' directory
        let isDevelopmentProcess = process.cwd().includes('server');
        let deployDirectoryPrefix = isDevelopmentProcess ? '..' : '.'
        let importScriptDirectoryPrefix = isDevelopmentProcess ? '.' : './server'
        const command = `${deployDirectoryPrefix}/deploy/scripts/export-and-exec.sh ${process.env.IMPORT_CONFIG} node ${importScriptDirectoryPrefix}/scripts/import-tests/index.js -c ${git_hash}`
        exec(
            command,
            (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                resolve({ stdout, stderr });
            }
        );
    });
}

module.exports = {
    /**
     * Functions that use importTests should be wrapped
     * in a try/catch in case the import script fails
     */
    async importTests(git_hash) {
        // check if version exists
        let results = await db.TestVersion.findAll({ where: { git_hash } });
        let versionExists = results.length === 0 ? false : true;
        if (versionExists) {
            return versionExists;
        } else {
            const { stdout, stderr } = await runImportScript(git_hash);
            return stdout.includes('no errors') && stderr === '';
        }
    }
};
