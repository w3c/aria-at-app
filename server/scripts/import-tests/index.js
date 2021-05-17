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
    Fetch most recent aria-at tests to update database. By default, the latest commit on master.
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

const ariaAtImport = {
    /**
     * Get all tests in the master HEAD commit for the default repository
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
                    path.join(tmpDirectory, '.git', 'refs', 'heads', 'master'),
                    'utf8'
                )
                .trim();
            commit = await nodegit.Commit.lookup(repo, latestCommit);
        }

        let commitDate = commit.date();
        let commitMsg = commit.message();
        let commitHash = commit.id().tostrS();

        const support = JSON.parse(fse.readFileSync(supportFile));
        const ats = support.ats;
        for (let at of ats) await this.upsertAt(at.name); // TODO: will we need to port support for at.key as well?

        const exampleNames = {};
        for (let example of support.examples)
            exampleNames[example.directory] = example.name;

        let exampleDirs = fse.readdirSync(testDirectory);
        for (let i = 0; i < exampleDirs.length; i++) {
            const exampleDir = exampleDirs[i];
            const subDirFullPath = path.join(testDirectory, exampleDir);
            const stat = fse.statSync(subDirFullPath); // folder stats

            // <repo>.git/tests/resources folder shouldn't be factored in the tests
            if (stat.isDirectory() && exampleDir !== 'resources') {
                const dataPath = path.join(subDirFullPath, 'data');
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

                // designPattern url parsed from <repo>.git/tests/<directory>/data/references.csv
                const practiceGuidelinesRefLine = referencesCsv
                    .split('\n')
                    .filter(line => line.includes('designPattern'));

                const testPlanId = await this.upsertTestPlan(
                    exampleDir,
                    exampleNames[exampleDir],
                    ariaAtRepo,
                    commitHash,
                    commitMsg,
                    commitDate,
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

                        await this.upsertTestPlanParsedTestActions(
                            testFullName,
                            htmlFile,
                            testPlanId,
                            commitHash,
                            commitMsg,
                            executionOrder
                        );
                    }
                }
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
     * Gets TestPlan.id and inserts a TestPlan record if it doesn't exist
     * @param {string} exampleDir - the name of the test directory to be processed
     * @param {string} exampleName - the name of the example test being processed
     * @param {string} ariaAtRepo - the repository url the tests are being pulled from (ideally {@link https://github.com/w3c/aria-at.git})
     * @param {string} commitHash - the hash of the latest version of tests pulled from the {@param ariaAtRepo} repository
     * @param {string} commitMsg - the message of the latest version of tests pulled from the {@param ariaAtRepo} repository
     * @param {string} commitDate - the date of the latest versions of the tests pulled from the {@param ariaAtRepo} repository
     * @param {string[]} exampleRefLine - the example url link pulled from the references.csv file related to the test
     * @param {string[]} practiceGuidelinesRefLine - the APG (ARIA Practices Guidelines) link pulled from the references.csv file related to the test
     * @returns {number} - returns TestPlan.id
     */
    async upsertTestPlan(
        exampleDir,
        exampleName,
        ariaAtRepo,
        commitHash,
        commitMsg,
        commitDate,
        exampleRefLine,
        practiceGuidelinesRefLine
    ) {
        const getReferenceUrl = referenceLine => {
            let url = null;
            if (referenceLine.length) {
                const [referenceType, link] = referenceLine[0].split(',');
                if (validUrl.isUri(link)) url = link;
                else
                    console.error(
                        `WARNING: The ${referenceType} link ${link} is not valid for ${exampleName}. Not writing to database.`
                    );
            }
            return url;
        };

        const exampleUrl = getReferenceUrl(exampleRefLine);
        const designPattern = getReferenceUrl(practiceGuidelinesRefLine);

        let parsedTest = {
            title: '',
            gitRepo: ariaAtRepo,
            directory: exampleDir,
            minimumInputCount: 0,
            maximumInputCount: 0,
            testActions: [],
            designPattern
        };

        // checking to see if unique testPlan row
        const testPlanResult = await client.query(
            'SELECT id, revision FROM "TestPlan" WHERE revision=$1 and "exampleUrl"=$2',
            [commitHash, exampleUrl]
        );

        const testPlan = testPlanResult.rowCount
            ? testPlanResult.rows[0]
            : await db.TestPlan.create({
                  title: exampleName,
                  publishStatus: 'draft',
                  revision: commitHash,
                  sourceGitCommit: commitMsg,
                  exampleUrl,
                  createdAt: commitDate,
                  parsedTest
              });
        return testPlan.id;
    },

    /**
     * Checks TestPlan.parsedTest.testActions to see if it has the relevant test actions to run the test and inserts it if not
     * @param {string} testName - the name of the test
     * @param {string} file - the relative path to the test file in the repository (ideally {@link https://github.com/w3c/aria-at.git})
     * @param {number} testPlanId - TestPlan.id to be queried to update the TestPlan.parsedTest.testActions if necessary
     * @param {string} commitHash - the hash of the latest version of tests pulled from the repository (ideally {@link https://github.com/w3c/aria-at.git})
     * @param {string} commitMsg - the message of the latest version of tests pulled from the repository (ideally {@link https://github.com/w3c/aria-at.git})
     * @param {number} executionOrder - the order in which the test step is executed (within the APG pattern)
     * @returns {number | null} - returns TestPlan.id
     */
    async upsertTestPlanParsedTestActions(
        testName,
        file,
        testPlanId,
        commitHash,
        commitMsg,
        executionOrder
    ) {
        const testPlanResult = await client.query(
            'SELECT id, "parsedTest" FROM "TestPlan" WHERE id=$1 AND revision=$2',
            [testPlanId, commitHash]
        );
        let testPlan = testPlanResult.rowCount ? testPlanResult.rows[0] : null;

        // check to see if test action object already exists in testActions dataset
        if (testPlan) {
            const testStepsFound = testPlan.parsedTest.testActions.find(
                test => test.executionOrder === executionOrder
            );
            // short circuit method because parsedTest.testActions.[action] is already present
            if (testStepsFound) return testPlan.id;
        }

        const testActionsObject = {
            file,
            executionOrder,
            // single quotes need to be managed to match PostgreSQL standard when inserting into jsonb
            name: testName.replace(/'/g, "''")
        };

        const result = await this.upsertRowReturnId(
            `UPDATE "TestPlan" SET "parsedTest" = jsonb_set("parsedTest"::jsonb, array['testActions'], ("parsedTest" -> 'testActions')::jsonb || '[${JSON.stringify(
                testActionsObject
            )}]'::jsonb) WHERE id=$1 AND "revision"=$2 RETURNING id`,
            [testPlanId, commitHash]
        );

        if (result) {
            await this.upsertRowReturnId(
                `UPDATE "TestPlan" SET "parsedTest" = "parsedTest" || CONCAT('{"maximumInputCount":', COALESCE("parsedTest" ->> 'maximumInputCount', '0')::int + 1, '}')::jsonb WHERE id=$1 AND "revision"=$2 RETURNING id`,
                [testPlanId, commitHash]
            );
        }

        return result;
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
