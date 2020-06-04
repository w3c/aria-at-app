const util = require('util');
const exec = util.promisify(require('child_process').exec);
const db = require('../models/index');

async function runImportScript(git_hash) {
    return new Promise(async(resolve, reject) => {
        try {
            const output = await exec(`yarn db-import-tests:dev -c ${git_hash}`);
            resolve(output)
        } catch (err) {
            reject(err)
        }
    }).catch(error => {
        throw error;
    })
}

module.exports = {
    async importTests(git_hash) {
        // check if version exists
        let results = await db.TestVersion.findAll({ where: { git_hash } });
        let versionExists = results.length === 0 ? false : true;
        if (versionExists) {
            return versionExists;
        } else {
            let importResult;
            try { 
                importResult = await runImportScript(git_hash);
                return importResult;
            } catch(error) {
                // This error happens when the script fails
                //  because the git hash is invalid;
                throw(error);
            }
        }
    }
}