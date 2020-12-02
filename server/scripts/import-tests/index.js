/* eslint no-console: 0 */

const path = require('path');
const nodegit = require('nodegit');
const { Client } = require('pg');
const fse = require('fs-extra');
const np = require('node-html-parser');

const args = require('minimist')(process.argv.slice(2), {
    alias: {
        h: 'help',
        c: 'commit'
    }
});

if (args.help) {
    console.log(`
Default use:
  No arguments:
    Fetch most recent aria-at tests to update database, by default, the lastest commit on master.
  Arguments:
    -h, --help
       Show this message.
    -c, --commit
       Import tests at the specified git commit

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

        let commit;
        if (args.commit) {
            try {
                commit = await nodegit.Commit.lookup(repo, args.commit);
            } catch (error) {
                console.log(
                    'IMPORT FAILED! Cannot checkout repo at comit:',
                    args.commit
                );
                throw error;
            }

            await nodegit.Checkout.tree(repo, commit);
            await repo.setHeadDetached(commit);
        } else {
            let latestCommit = fse
                .readFileSync(
                    path.join(tmpDirectory, '.git', 'refs', 'heads', 'master'),
                    'utf8'
                )
                .trim();
            commit = await nodegit.Commit.lookup(repo, latestCommit);
        }

        let commitDate = commit.date();
        let commitMsg = commit.message();
        let commitHash = commit.id().tostrS();

        const testVersionID = await this.upsertTestVersion(
            ariaAtRepo,
            commitHash,
            commitDate,
            commitMsg
        );

        const support = JSON.parse(fse.readFileSync(supportFile));
        const ats = support.ats;
        for (let at of ats) {
            const atNameID = await this.upsertAtName(at.name);
            const atID = await this.upsertAt(at.key, atNameID, testVersionID);
            at.atID = atID;
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
                const dataPath = path.join(subDirFullPath, 'data');
                const referencesCsvPath = path.join(dataPath, 'references.csv');
                const referencesCsv = fse.readFileSync(referencesCsvPath, { encoding: 'utf-8' });

                const exampleRefLine = referencesCsv.split('\n').filter(line => line.includes('example'));
                const practiceGuidelinesRefLine = referencesCsv.split('\n').filter(line => line.includes('practiceGuide'));

                const exampleID = await this.upsertAPGExample(
                    exampleDir,
                    exampleName[exampleDir],
                    testVersionID,
                    exampleRefLine,
                    practiceGuidelinesRefLine
                );
                
                let tests = fse.readdirSync(subDirFullPath);

                for (let j = 0; j < tests.length; j++) {
                    const test = tests[j];
                    const testFullPath = path.join(subDirFullPath, test);
                    if (
                        path.extname(test) === '.html' &&
                        test !== 'index.html'
                    ) {
                        // Get the test name from the html file
                        const htmlFile = path.relative(
                            tmpDirectory,
                            testFullPath
                        );
                        const root = np.parse(
                            fse.readFileSync(testFullPath, 'utf8'),
                            { script: true }
                        );
                        const testFullName = root.querySelector('title')
                            .innerHTML;

                        // Get the test order from the file name
                        const executionOrder = parseInt(test.split('-')[1]);

                        const testID = await this.upsertTest(
                            testFullName,
                            htmlFile,
                            exampleID,
                            testVersionID,
                            executionOrder
                        );

                        const testBaseName = path.basename(test, '.html');
                        const jsonFile = path.join(
                            subDirFullPath,
                            `${testBaseName}.json`
                        );
                        const testData = JSON.parse(
                            fse.readFileSync(jsonFile, 'utf8')
                        );

                        let appliesToList = [];
                        for (let a of testData.applies_to) {
                            if (support.applies_to[a]) {
                                appliesToList = appliesToList.concat(
                                    support.applies_to[a]
                                );
                            } else {
                                appliesToList.push(a);
                            }
                        }

                        // There is a bug in the test where sometimes "key" is used in the applies to list,
                        // and sometimes the "name"
                        for (let name of appliesToList) {
                            const at = support.ats.find(
                                a => a.name === name || a.key === name
                            );
                            if (at) {
                                await this.upsertTestToAt(testID, at.atID);
                            }
                        }
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
     * @param {string} commitMsg - the message of the import
     * @return {string} id
     */
    async upsertTestVersion(ariaAtRepo, latestCommit, commitDate, commitMsg) {
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
                "INSERT INTO test_version(git_repo, git_hash, datetime, git_commit_msg) VALUES($1, $2, to_date($3, 'YYYY-MM-DDTHH:MI:SS.MSZ'), $4) RETURNING id",
                [ariaAtRepo, latestCommit, commitDate, commitMsg]
            );
        }
        return testVersionID;
    },

    /**
     * Gets at_name.id and adds the at_name record if it does not exist
     * @param {string} atName - the human readible name for an AT
     * @return {int} id
     */
    async upsertAtName(atName) {
        const atResult = await client.query(
            'SELECT id FROM at_name WHERE name=$1',
            [atName]
        );
        let atNameID = atResult.rowCount ? atResult.rows[0].id : undefined;
        if (!atNameID) {
            atNameID = await this.insertRowReturnId(
                'INSERT INTO at_name(name) VALUES($1) RETURNING id',
                [atName]
            );
        }
        return atNameID;
    },

    /**
     * Gets at.id and adds an at record if it does not exist
     * @param {string} atKey - the key for the AT (supplied from the test repo's support.json file)
     * @param {string} atName - the human readible name for an AT
     * @param {int} testVersionID - foreign key into the test_version table
     * @return {int} id
     */
    async upsertAt(atKey, atNameID, testVersionID) {
        const atKeyResult = await client.query(
            'SELECT id FROM at WHERE key=$1 and test_version_id=$2',
            [atKey, testVersionID]
        );
        let atKeyID = atKeyResult.rowCount ? atKeyResult.rows[0].id : undefined;
        if (!atKeyID) {
            atKeyID = await this.insertRowReturnId(
                'INSERT INTO at(key, at_name_id, test_version_id) VALUES($1, $2, $3) RETURNING id',
                [atKey, atNameID, testVersionID]
            );
        }
        return atKeyID;
    },

    /**
     * Gets apg_example.id and adds the AT key record if it does not exist
     * @param {string} atKey - the key for the AT (supplied from the test repo's support.json file)
     * @param {string} atName - the human readible name for an AT
     * @param {int} testVersionID - foreign key into the test_version table
     * @return {int} id
     */
    async upsertAPGExample(exampleDir, exampleName, testVersionID, exampleRefLine, practiceGuidelinesRefLine) {
        const exampleResult = await client.query(
            'SELECT id, example, practice_guide FROM apg_example WHERE directory=$1 and test_version_id=$2',
            [exampleDir, testVersionID]
        );

        let example = exampleResult.rowCount
            ? exampleResult.rows[0]
            : undefined;

        if (!example) {
            example = await this.insertRow(
                'INSERT INTO apg_example(directory, name, test_version_id) VALUES($1, $2, $3) RETURNING id, example, practice_guide',
                [exampleDir, exampleName, testVersionID]
            );
        }

        if (exampleRefLine.length > 0 && !example.example) {
            const exampleLink = exampleRefLine[0].split(',')[1];
            example = await this.insertRow(
                'UPDATE apg_example SET example=$1 WHERE id=$2 RETURNING id, example, practice_guide;',
                [exampleLink, example.id]
            )
        }


        if (practiceGuidelinesRefLine.length > 0 && !example.practice_guide) {
            const practiceGuidelinesLink = practiceGuidelinesRefLine[0].split(',')[1];
            example = await this.insertRow(
                'UPDATE apg_example SET practice_guide=$1 WHERE id=$2 RETURNING id, example, practice_guide;',
                [practiceGuidelinesLink, example.id]
            )
        }

        return example.id;
    },

    /**
     * Gets the test id and adds the test record if it does not exist
     * @param {string} testFullName - the name of the test
     * @param {string} file - the relative path to the test in the repo
     * @param {int} exampleID - foreign key into the apg_example table
     * @param {int} testVersionID - foreign key into the test_version table
     * @param {int} executionOrder - order of the tests (within APG pattern)
     * @return {int} id
     */
    async upsertTest(
        testFullName,
        file,
        exampleID,
        testVersionID,
        executionOrder
    ) {
        const testResult = await client.query(
            'SELECT id FROM test WHERE file=$1 AND test_version_id=$2',
            [file, testVersionID]
        );
        let testID = testResult.rowCount ? testResult.rows[0].id : undefined;
        if (!testID) {
            testID = await this.insertRowReturnId(
                'INSERT INTO test(name, file, apg_example_id, test_version_id, execution_order) VALUES($1, $2, $3, $4, $5) RETURNING id',
                [testFullName, file, exampleID, testVersionID, executionOrder]
            );
        }
        return testID;
    },

    /**
     * Adds the test to at record if it does not exist
     * @param {int} testID - foreign key into the test table
     * @param {int} atID - foreign key into the at table
     */
    async upsertTestToAt(testID, atID) {
        const testToAtResult = await client.query(
            'SELECT id FROM test_to_at WHERE test_id=$1 AND at_id=$2',
            [testID, atID]
        );
        let testToAtID = testToAtResult.rowCount
            ? testToAtResult.rows[0].id
            : undefined;
        if (!testToAtID) {
            testToAtID = await this.insertRowReturnId(
                'INSERT INTO test_to_at(test_id, at_id) VALUES($1, $2) RETURNING id',
                [testID, atID]
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
    },

    async insertRow(query, params) {
        let result;
        try {
            result = (await client.query(query, params)).rows[0];
        } catch (err) {
            console.log(
                `ERROR: Insertion query '${query}' with parameters '[${params}]' should return id.`
            );
            throw err;
        }
        return result;
    },
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
