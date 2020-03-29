/* eslint no-console: 0 */

const path = require('path');
const nodegit = require('nodegit');
const { Client } = require('pg');
const fse = require('fs-extra');
const np = require('node-html-parser');

const args = require('minimist')(process.argv.slice(2), {
    alias: {
        h: 'help'
    }
});

if (args.help) {
    console.log(`
Default use:
  No arguments:
    Will fetch most recent aria-at tests to update database.
  Arguments:
    -h, --help
       Show this message.
`);
    process.exit();
}

const client = new Client();

const ariaAtRepo = 'https://github.com/w3c/aria-at.git';
const tmpDirectory = path.resolve(__dirname, 'tmp');
const testDirectory = path.resolve(tmpDirectory, 'tests');
const supportFile = path.resolve(testDirectory, 'support.json');

const ariaat = {
    /**
     * Get all tests in the master HEAD commit for the detaul repository
     */
    async getMostRecentTests() {
        await client.connect();

        fse.ensureDirSync(tmpDirectory);
        let repo = await nodegit.Clone(ariaAtRepo, tmpDirectory, {});
        console.log(
            'Cloned ' + path.basename(ariaAtRepo) + ' to ' + repo.workdir()
        );

        let latestCommit = fse
            .readFileSync(
                path.join(tmpDirectory, '.git', 'refs', 'heads', 'master'),
                'utf8'
            )
            .trim();
        let commit = await nodegit.Commit.lookup(repo, latestCommit);
        let commitDate = commit.date();

        const testVersionID = await this.upsertTestVersion(
            ariaAtRepo,
            latestCommit,
            commitDate
        );

        const support = JSON.parse(fse.readFileSync(supportFile));
        for (let at of support.ats) {
            const atID = await this.upsertAt(at.name);
            await this.upsertAtKey(at.key, atID, testVersionID);
        }

        const exampleName = {};
        for (let example of support.examples) {
            exampleName[example.directory] = example.name;
        }

        let exampleDirs = fse.readdirSync(testDirectory);
        for (let i = 0; i < exampleDirs.length; i++) {
            const exampleDir = exampleDirs[i];
            const subDirFullPath = path.join(testDirectory, exampleDir);
            const stat = fse.statSync(subDirFullPath);

            if (stat.isDirectory() && exampleDir !== 'resources') {
                const exampleID = await this.upsertAPGExample(
                    exampleDir,
                    exampleName[exampleDir],
                    testVersionID
                );
                let tests = fse.readdirSync(subDirFullPath);

                for (let j = 0; j < tests.length; j++) {
                    const test = tests[j];
                    const testFullPath = path.join(subDirFullPath, test);

                    if (
                        path.extname(test) === '.html' &&
                        test !== 'index.html'
                    ) {
                        const file = path.relative(tmpDirectory, testFullPath);
                        const root = np.parse(
                            fse.readFileSync(testFullPath, 'utf8'),
                            { script: true }
                        );
                        const testFullName = root.querySelector('title')
                            .innerHTML;
                        await this.upsertTest(
                            testFullName,
                            file,
                            exampleID,
                            testVersionID
                        );
                    }
                }
            }
        }
    },

    /**
     * Gets test version ID and adds test version record if it does not exist
     * @param {string} ariaAtRepo - the repository where these tests exist
     * @param {string} latestCommit - the commit in refs/heads/master at the time of import
     * @param {string} commitDate - the date of import in ISO format
     * @return {string} id
     */
    async upsertTestVersion(ariaAtRepo, latestCommit, commitDate) {
        const testVersionResult = await client.query(
            'SELECT id FROM test_version WHERE git_repo=$1 and git_hash=$2',
            [ariaAtRepo, latestCommit]
        );
        let testVersionID = testVersionResult.rowCount
            ? testVersionResult.rows[0].id
            : undefined;
        if (testVersionID) {
            console.log(
                `Test version information exists for: ${ariaAtRepo} ${commitDate}`
            );
        } else {
            testVersionID = await this.insertRowReturnId(
                "INSERT INTO test_version(git_repo, git_hash, datetime) VALUES($1, $2, to_date($3, 'YYYY-MM-DDTHH:MI:SS.MSZ')) RETURNING id",
                [ariaAtRepo, latestCommit, commitDate]
            );
        }
        console.log(typeof testVersionID);
        return testVersionID;
    },

    /**
     * Gets at.id and adds the AT record if it does not exist
     * @param {string} atName - the human readible name for an AT
     * @return {int} id
     */
    async upsertAt(atName) {
        const atResult = await client.query('SELECT id FROM at WHERE name=$1', [
            atName
        ]);
        let atID = atResult.rowCount ? atResult.rows[0].id : undefined;
        if (!atID) {
            atID = await this.insertRowReturnId(
                'INSERT INTO at(name) VALUES($1) RETURNING id',
                [atName]
            );
        }
        return atID;
    },

    /**
     * Adds the at_key record if it does not exist
     * @param {string} atKey - the key for the AT (supplied from the test repo's support.json file)
     * @param {string} atName - the human readible name for an AT
     * @param {int} testVersionID - foreign key into the test_version table
     */
    async upsertAtKey(atKey, atID, testVersionID) {
        const atKeyResult = await client.query(
            'SELECT id FROM at_key WHERE key=$1 and test_version_id=$2',
            [atKey, testVersionID]
        );
        let atKeyID = atKeyResult.rowCount ? atKeyResult.rows[0].id : undefined;
        if (!atKeyID) {
            await client.query(
                'INSERT INTO at_key(key, at_id, test_version_id) VALUES($1, $2, $3) RETURNING id',
                [atKey, atID, testVersionID]
            );
        }
    },

    /**
     * Gets apg_example.id and adds the AT key record if it does not exist
     * @param {string} atKey - the key for the AT (supplied from the test repo's support.json file)
     * @param {string} atName - the human readible name for an AT
     * @param {int} testVersionID - foreign key into the test_version table
     * @return {int} id
     */
    async upsertAPGExample(exampleDir, exampleName, testVersionID) {
        const exampleResult = await client.query(
            'SELECT id FROM apg_example WHERE directory=$1 and test_version_id=$2',
            [exampleDir, testVersionID]
        );
        let exampleID = exampleResult.rowCount
            ? exampleResult.rows[0].id
            : undefined;
        if (!exampleID) {
            exampleID = await this.insertRowReturnId(
                'INSERT INTO apg_example(directory, name, test_version_id) VALUES($1, $2, $3) RETURNING id',
                [exampleDir, exampleName, testVersionID]
            );
        }
        return exampleID;
    },

    /**
     * Adds the test record if it does not exist
     * @param {string} testFullName - the name of the test
     * @param {string} file - the relative path to the test in the repo
     * @param {int} exampleID - foreign key into the apg_example table
     * @param {int} testVersionID - foreign key into the test_version table
     */
    async upsertTest(testFullName, file, exampleID, testVersionID) {
        const testResult = await client.query(
            'SELECT id FROM test WHERE file=$1 AND test_version_id=$2',
            [file, testVersionID]
        );
        let testID = testResult.rowCount ? testResult.rows[0].id : undefined;
        if (!testID) {
            testID = await this.insertRowReturnId(
                'INSERT INTO test(name, file, apg_example_id, test_version_id) VALUES($1, $2, $3, $4) RETURNING id',
                [testFullName, file, exampleID, testVersionID]
            );
        }
    },

    async insertRowReturnId(query, params) {
        let result;
        try {
            result = (await client.query(query, params)).rows[0];
        } catch (err) {
            console.log(
                `ERROR: Insertion query '${query}' with parameters '[${params}]' should return id.`
            );
            throw err;
        }
        return result.id;
    }
};

ariaat
    .getMostRecentTests()
    .then(
        () => console.log('Done, no errors'),
        err => {
            console.error(`Error found: ${err.stack}`);
            process.exitCode = 1;
        }
    )
    .finally(() => {
        // Delete temporary files
        fse.removeSync(tmpDirectory);
        client.end();
        process.exit();
    });
