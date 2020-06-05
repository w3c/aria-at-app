const { exec } = require('child_process');
const db = require('../models/index');

async function runImportScript(git_hash) {
    return new Promise(async(resolve, reject) => {
        exec(`yarn db-import-tests:dev -c ${git_hash}`, (error, stdout, stderr) => {
            if (error) {
                reject(error)
            }
            resolve({stdout, stderr})
        });
    });
}

module.exports = {
    async importTests(git_hash) {
        // check if version exists
        let results = await db.TestVersion.findAll({ where: { git_hash } });
        let versionExists = results.length === 0 ? false : true;
        if (versionExists) {
            return versionExists;
        } else {
            try { 
                const {stdout, stderr} = await runImportScript(git_hash);
                return stdout.includes('no errors') && stderr === '';
            } catch(error) {
                // This error happens when the script fails
                //  because the git hash is invalid;
                throw(error);
            }
        }
    }
}