/* eslint no-console: 0 */

const path = require('path');
const nodegit = require('nodegit');
const { Client } = require('pg');
const fse = require('fs-extra');
const np = require('node-html-parser');
const db = require('../../models/index');
const validUrl = require('valid-url');

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
    Fetch most recent aria-at tests to update database. By default, the latest commit on the default branch.
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
const DEFAULT_BRANCH = 'master';
const tmpDirectory = path.resolve(__dirname, 'tmp');
const testsBuildDirectory = path.resolve(tmpDirectory, 'build', 'tests');
const testsDirectory = path.resolve(tmpDirectory, 'tests');

const ariaAtImport = {
    /**
     * Get all tests in the default HEAD commit for the repository
     */
    async getMostRecentTests() {
        await client.connect();

        fse.ensureDirSync(tmpDirectory);
        let repo = await nodegit.Clone(ariaAtRepo, tmpDirectory, {});
        console.log(`Cloned ${path.basename(ariaAtRepo)} to ${repo.workdir()}`);

        let commit;
        if (args.commit) {
            try {
                commit = await nodegit.Commit.lookup(repo, args.commit);
            } catch (error) {
                console.log(
                    `IMPORT FAILED! Cannot checkout repo at commit: ${args.commit}`
                );
                throw error;
            }

            await nodegit.Checkout.tree(repo, commit);
            await repo.setHeadDetached(commit);
        } else {
            let latestCommit = fse
                .readFileSync(
                    path.join(
                        tmpDirectory,
                        '.git',
                        'refs',
                        'heads',
                        DEFAULT_BRANCH
                    ),
                    'utf8'
                )
                .trim();
            commit = await nodegit.Commit.lookup(repo, latestCommit);
        }

        // use to conditionally determine paths to use based on whether or not
        // the commit pulled for the aria-at repo is the old or new structure
        const buildDirExists = fse.existsSync(testsBuildDirectory);
        const supportFile = buildDirExists
            ? path.resolve(testsBuildDirectory, 'support.json')
            : path.resolve(testsDirectory, 'support.json');

        let commitDate = commit.date();
        let commitMessage = commit.message();
        let commitHash = commit.id().tostrS();

        const support = JSON.parse(fse.readFileSync(supportFile));
        const ats = support.ats;
        for (let at of ats) await this.upsertAt(at.name);

        const exampleNames = {};
        for (let example of support.examples)
            exampleNames[example.directory] = example.name;

        let testPlanDirs = fse.readdirSync(
            buildDirExists ? testsBuildDirectory : testsDirectory
        );
        for (let i = 0; i < testPlanDirs.length; i++) {
            const testPlanDir = testPlanDirs[i];
            const testPlanDirPath = path.join(
                buildDirExists ? testsBuildDirectory : testsDirectory,
                testPlanDir
            );

            // check source location of test plan directories because of the new 'build' directory set up
            const sourceTestPlanDirPath = path.join(
                testsDirectory,
                testPlanDir
            );
            const stat = fse.statSync(testPlanDirPath); // folder stats

            // <repo>.git/tests/resources folder shouldn't be factored in the tests
            if (
                fse.existsSync(sourceTestPlanDirPath) && // explicitly check if source test plan directory exists
                stat.isDirectory() &&
                testPlanDir !== 'resources'
            ) {
                // check multiple locations for relevant data folder that contains references.csv
                const dataPath = path.join(
                    buildDirExists ? sourceTestPlanDirPath : testPlanDirPath,
                    'data'
                );

                // 'references.csv' only exists in <root>/tests/<directory>/data/references.csv
                // doesn't exist in <root>/build/tests/<directory>/data/references.csv
                const referencesCsvPath = path.join(dataPath, 'references.csv');

                let referencesCsv;
                try {
                    referencesCsv = fse.readFileSync(referencesCsvPath, {
                        encoding: 'utf-8'
                    });
                } catch (error) {
                    console.error(
                        `Reference file, ${referencesCsvPath}, does not exist!`
                    );
                    throw error;
                }

                // example url parsed from <repo>.git/tests/<directory>/data/references.csv
                const exampleRefLine = referencesCsv
                    .split('\n')
                    .filter(line => line.includes('example'));

                const testReferenceRefLine = referencesCsv
                    .split('\n')
                    .filter(line => line.includes('reference'));

                // designPattern url parsed from <repo>.git/tests/<directory>/data/references.csv
                const practiceGuidelinesRefLine = referencesCsv
                    .split('\n')
                    .filter(line => line.includes('designPattern'));

                const tests = [];
                const testFiles = fse.readdirSync(testPlanDirPath);

                for (let j = 0; j < testFiles.length; j++) {
                    const testFile = testFiles[j];
                    const testPath = path.join(testPlanDirPath, testFile);
                    if (
                        path.extname(testFile) === '.html' &&
                        testFile !== 'index.html'
                    ) {
                        // Get the testFile name from the html file
                        const htmlFile = path.relative(tmpDirectory, testPath);
                        const root = np.parse(
                            fse.readFileSync(testPath, 'utf8'),
                            { script: true }
                        );

                        // parse test's name
                        const testFullName = root.querySelector('title')
                            .innerHTML;

                        // parse scripts to be ran from html
                        const { text: scripts } = root.querySelectorAll(
                            'script'
                        )[0];

                        // parse testJson and commandJson from html
                        const {
                            text: testCommandScriptText
                        } = root.querySelectorAll('script')[1];

                        const testJsonStartPattern = 'const testJson = {';
                        const commandJsonStartPattern = 'const commandJson = {';
                        const endPattern = '};';

                        const getJsonTestCommandStringFromText = (
                            text,
                            startPattern,
                            endPattern
                        ) => {
                            let string = '';
                            if (text.indexOf(startPattern) > -1) {
                                string = text.substring(
                                    text.indexOf(startPattern)
                                );
                                string = string.substring(
                                    0,
                                    string.indexOf(endPattern) + 1
                                );
                                string = string.substring(string.indexOf('{'));
                                return string;
                            }
                            return string;
                        };

                        const testJsonString = getJsonTestCommandStringFromText(
                            testCommandScriptText,
                            testJsonStartPattern,
                            endPattern
                        );
                        const commandJsonString = getJsonTestCommandStringFromText(
                            testCommandScriptText,
                            commandJsonStartPattern,
                            endPattern
                        );

                        let testJson = {};
                        let commandJson = {};

                        try {
                            testJson = JSON.parse(testJsonString);
                        } catch (e) {
                            console.error(
                                `error.parse.testJson:${testJsonString}`
                            );
                        }

                        try {
                            commandJson = JSON.parse(commandJsonString);
                        } catch (e) {
                            console.error(
                                `error.parse.testJson:${testJsonString}`
                            );
                        }

                        // Get the testFile order from the file name
                        const executionOrder = parseInt(testFile.split('-')[1]);

                        tests.push({
                            testFullName,
                            htmlFile,
                            commitHash,
                            executionOrder,
                            testJson,
                            commandJson,
                            scripts: scripts.trim()
                        });
                    }
                }
                await this.upsertTestPlanVersion(
                    testPlanDir,
                    exampleNames[testPlanDir],
                    ariaAtRepo,
                    commitHash,
                    commitMessage,
                    commitDate,
                    exampleRefLine,
                    practiceGuidelinesRefLine,
                    testReferenceRefLine,
                    tests
                );
            }
        }
    },

    /**
     * Gets At.id and inserts an At record if it doesn't exist
     * @param {string} atName - name of AT (Assistive Technology)
     * @returns {number} - returns At.id
     */
    async upsertAt(atName) {
        const atResult = await client.query(
            'SELECT id FROM "At" WHERE name=$1',
            [atName]
        );

        const at = atResult.rowCount
            ? atResult.rows[0]
            : await this.upsertRowReturnId(
                  'INSERT INTO "At" (name) VALUES($1) RETURNING id',
                  [atName]
              );
        return at.id;
    },

    /**
     * Gets TestPlanVersion.id and inserts a TestPlanVersion record if it doesn't exist
     * @param {string} exampleDir - the name of the test directory to be processed
     * @param {string} exampleName - the name of the example test being processed
     * @param {string} ariaAtRepo - the repository url the tests are being pulled from (ideally {@link https://github.com/w3c/aria-at.git})
     * @param {string} commitHash - the hash of the latest version of tests pulled from the {@param ariaAtRepo} repository
     * @param {string} commitMessage - the message of the latest version of tests pulled from the {@param ariaAtRepo} repository
     * @param {string} commitDate - the date of the latest versions of the tests pulled from the {@param ariaAtRepo} repository
     * @param {string[]} exampleRefLine - the example url link pulled from the references.csv file related to the test
     * @param {string[]} practiceGuidelinesRefLine - the APG (ARIA Practices Guidelines) link pulled from the references.csv file related to the test
     * @param {string[]} testReferenceRefLine - the relative link that's opened for the test page, pulled from the references.csv file related to the test
     * @param {object[]} tests - test steps for the test plan pulled from the {@param ariaAtRepo} repository
     * @returns {number} - returns TestPlanVersion.id
     */
    async upsertTestPlanVersion(
        exampleDir,
        exampleName,
        ariaAtRepo,
        commitHash,
        commitMessage,
        commitDate,
        exampleRefLine,
        practiceGuidelinesRefLine,
        testReferenceRefLine,
        tests
    ) {
        const getReferenceUrl = (referenceLine, ignoreValidation = false) => {
            let url = null;
            if (referenceLine.length) {
                const [referenceType, link] = referenceLine[0].split(',');
                if (ignoreValidation) url = link;
                else {
                    if (validUrl.isUri(link)) url = link;
                    else
                        console.error(
                            `WARNING: The ${referenceType} link ${link} is not valid for ${exampleName}. Not writing to database.`
                        );
                }
            }
            return url;
        };

        const exampleUrl = getReferenceUrl(exampleRefLine);
        const designPattern = getReferenceUrl(practiceGuidelinesRefLine);
        const testReferencePath = getReferenceUrl(testReferenceRefLine, true);

        let metadata = {
            gitRepo: ariaAtRepo,
            directory: exampleDir,
            designPattern,
            testReferencePath
        };

        // checking to see if unique testPlanVersion row (gitSha + directory provides a unique row)
        const testPlanVersionResult = await client.query(
            'SELECT id, "gitSha" FROM "TestPlanVersion" WHERE "gitSha"=$1 and metadata ->> \'directory\'=$2',
            [commitHash, exampleDir]
        );

        if (testPlanVersionResult.rowCount) {
            await client.query(
                'UPDATE "TestPlanVersion" SET title=$1, "exampleUrl"=$2, metadata=$3, tests=$4 WHERE "gitSha"=$5 and metadata ->> \'directory\'=$6',
                [
                    exampleName,
                    exampleUrl,
                    metadata,
                    tests,
                    commitHash,
                    exampleDir
                ]
            );
            return;
        }

        await db.TestPlanVersion.create({
            title: exampleName,
            status: 'DRAFT',
            gitSha: commitHash,
            gitMessage: commitMessage,
            updatedAt: commitDate,
            exampleUrl,
            metadata,
            tests
        });
    },

    /**
     * PostgreSQL query handler to return a single result's id following a successful query
     * @param {string} query - the PostgreSQL query to be processed
     * @param {any[]} params - the params to be used when creating the PostgreSQL query
     * @returns {* | null} - returns id for queried row
     */
    async upsertRowReturnId(query, params) {
        let result;
        try {
            result = (await client.query(query, params)).rows[0];
        } catch (err) {
            console.log(
                `ERROR: Upsert Query '${query}' with parameters '[${params}]' should return id.`
            );
            throw err;
        }
        if (result && result.id) return result.id;
        return null;
    },

    /**
     * PostgreSQL query handler to return a single result following a successful query
     * @param {string} query - the PostgreSQL query to be processed
     * @param {any[]} params - the params to be used when creating the PostgreSQL query
     * @returns {* | null} - returns record for queried row
     */
    async performQuery(query, params) {
        let result;
        try {
            result = (await client.query(query, params)).rows[0];
        } catch (err) {
            console.log(
                `ERROR: Query '${query}' with parameters '[${params}]' should return id.`
            );
            throw err;
        }
        return result;
    }
};

ariaAtImport
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
