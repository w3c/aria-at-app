/* eslint no-console: 0 */

const path = require('path');
const { Client } = require('pg');
const fse = require('fs-extra');
const spawn = require('cross-spawn');
const { At } = require('../../models');
const {
    createTestPlanVersion,
    getTestPlanVersions,
    updateTestPlanVersion
} = require('../../models/services/TestPlanVersionService');
const {
    getTestPlans,
    createTestPlan
} = require('../../models/services/TestPlanService');
const {
    createTestId,
    createScenarioId,
    createAssertionId
} = require('../../services/PopulatedData/locationOfDataId');
const deepPickEqual = require('../../util/deepPickEqual');
const { hashTests } = require('../../util/aria');

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
const ariaAtDefaultBranch = 'master';
const gitCloneDirectory = path.resolve(__dirname, 'tmp');
const builtTestsDirectory = path.resolve(gitCloneDirectory, 'build', 'tests');
const testsDirectory = path.resolve(gitCloneDirectory, 'tests');

const gitRun = (args, cwd = gitCloneDirectory) => {
    return spawn
        .sync('git', args.split(' '), { cwd })
        .stdout.toString()
        .trimEnd();
};

const importTestPlanVersions = async () => {
    await client.connect();

    const { gitCommitDate } = await readRepo();

    console.log('Running `npm install` ...\n');
    const installOutput = spawn.sync('npm', ['install'], {
        cwd: gitCloneDirectory
    });
    console.log('`npm install` output', installOutput.stdout.toString());

    console.log('Running `npm run build` ...\n');
    const buildOutput = spawn.sync('npm', ['run', 'build'], {
        cwd: gitCloneDirectory
    });
    console.log('`npm run build` output', buildOutput.stdout.toString());

    const ats = await At.findAll();
    await updateAtsJson(ats);

    await updateCommandsJson();

    for (const directory of fse.readdirSync(builtTestsDirectory)) {
        if (directory === 'resources') continue;

        const builtDirectoryPath = path.join(builtTestsDirectory, directory);
        const sourceDirectoryPath = path.join(testsDirectory, directory);

        // https://github.com/w3c/aria-at/commit/9d73d6bb274b3fe75b9a8825e020c0546a33a162
        // This is the date of the last commit before the build folder removal.
        // Meant to support backward compatability until the existing tests can
        // be updated to the current structure
        const buildRemovalDate = new Date('2022-03-10 18:08:36.000000 +00:00');
        const useBuildInAppAppUrlPath =
            gitCommitDate.getTime() <= buildRemovalDate.getTime();

        if (
            !(
                fse.existsSync(sourceDirectoryPath) &&
                fse.statSync(builtDirectoryPath).isDirectory()
            )
        ) {
            continue;
        }

        // Gets the next ID and increments the ID counter in Postgres
        // Needed to create the testIds - see LocationOfDataId.js for more info
        const testPlanVersionId = (
            await client.query(
                `SELECT nextval(
                    pg_get_serial_sequence('"TestPlanVersion"', 'id')
                )`
            )
        ).rows[0].nextval;

        // Target the specific /tests/<pattern> directory to determine when a pattern's folder was
        // actually last changed
        const {
            gitSha,
            gitMessage,
            gitCommitDate: updatedAt
        } = readDirectoryGitInfo(sourceDirectoryPath);

        const tests = getTests({
            builtDirectoryPath,
            testPlanVersionId,
            ats,
            gitSha
        });

        const hashedTests = hashTests(tests);

        const existing = await getTestPlanVersions('', { hashedTests });

        if (existing.length) continue;

        const { title, exampleUrl, designPatternUrl, testPageUrl } = readCsv({
            sourceDirectoryPath
        });

        let testPlanId = null;
        const associatedTestPlans = await getTestPlans({ directory });

        if (associatedTestPlans.length) {
            testPlanId = associatedTestPlans[0].dataValues.id;
        } else {
            const newTestPlan = await createTestPlan({ title, directory });
            testPlanId = newTestPlan.dataValues.id;
        }

        // Check if any TestPlanVersions exist for the directory and is currently in RD, and set it
        // to DEPRECATED
        const testPlanVersionsToDeprecate = await getTestPlanVersions('', {
            phase: 'RD',
            directory
        });
        if (testPlanVersionsToDeprecate.length) {
            for (const testPlanVersion of testPlanVersionsToDeprecate) {
                await updateTestPlanVersion(testPlanVersion.id, {
                    phase: 'DEPRECATED',
                    deprecatedAt: updatedAt
                });
            }
        }

        await createTestPlanVersion({
            id: testPlanVersionId,
            title,
            directory,
            testPageUrl: getAppUrl(testPageUrl, {
                gitSha,
                directoryPath: useBuildInAppAppUrlPath
                    ? builtDirectoryPath
                    : sourceDirectoryPath
            }),
            gitSha,
            gitMessage,
            hashedTests,
            updatedAt,
            metadata: {
                designPatternUrl,
                exampleUrl
            },
            tests,
            testPlanId
        });
    }
};

const readRepo = async () => {
    fse.ensureDirSync(gitCloneDirectory);

    console.info('Cloning aria-at repo ...');
    spawn.sync('git', ['clone', ariaAtRepo, gitCloneDirectory]);
    console.info('Cloning aria-at repo complete.');

    gitRun(`checkout ${args.commit ?? ariaAtDefaultBranch}`);

    const gitCommitDate = new Date(gitRun(`log --format=%aI -n 1`));

    return { gitCommitDate };
};

const readDirectoryGitInfo = directoryPath => {
    const gitSha = gitRun(`log -1 --format=%H -- .`, directoryPath);
    const gitMessage = gitRun(`log -1 --format=%s -- .`, directoryPath);
    const gitCommitDate = new Date(
        gitRun(`log -1 --format=%aI -- .`, directoryPath)
    );

    return { gitSha, gitMessage, gitCommitDate };
};

const getAppUrl = (directoryRelativePath, { gitSha, directoryPath }) => {
    return path.join(
        '/',
        'aria-at', // The app's proxy to the ARIA-AT repo
        gitSha,
        path.relative(
            gitCloneDirectory,
            path.join(directoryPath, directoryRelativePath)
        )
    );
};

const readCsv = ({ sourceDirectoryPath }) => {
    // 'references.csv' only exists in <root>/tests/<directory>/data/references.csv
    // doesn't exist in <root>/build/tests/<directory>/data/references.csv
    const referencesCsvPath = path.join(
        sourceDirectoryPath,
        'data',
        'references.csv'
    );

    const referencesCsv = fse.readFileSync(referencesCsvPath, {
        encoding: 'utf-8'
    });

    const getCsvValue = refId => {
        const line = referencesCsv
            .split('\n')
            .find(line => line.includes(refId));
        const columns = line?.split(',');
        return columns?.[1];
    };

    return {
        title: getCsvValue('title'),
        exampleUrl: getCsvValue('example'),
        designPatternUrl: getCsvValue('designPattern'),
        testPageUrl: getCsvValue('reference')
    };
};

const updateCommandsJson = async () => {
    const keysMjsPath = path.join(testsDirectory, 'resources', 'keys.mjs');

    const commands = Object.entries(await import(keysMjsPath)).map(
        ([id, text]) => ({ id, text })
    );

    await fse.writeFile(
        path.resolve(__dirname, '../../resources/commands.json'),
        JSON.stringify(commands, null, 4)
    );
};

const updateAtsJson = async ats => {
    await fse.writeFile(
        path.resolve(__dirname, '../../resources/ats.json'),
        JSON.stringify(
            ats.map(at => at.dataValues),
            null,
            4
        )
    );
};

const getTests = ({ builtDirectoryPath, testPlanVersionId, ats, gitSha }) => {
    const tests = [];

    const renderedUrlsByNumber = {};
    const allCollectedByNumber = {};
    fse.readdirSync(builtDirectoryPath).forEach(filePath => {
        if (!filePath.endsWith('.collected.json')) return;
        const jsonPath = path.join(builtDirectoryPath, filePath);
        const jsonString = fse.readFileSync(jsonPath, 'utf8');
        const collected = JSON.parse(jsonString);
        const renderedUrl = filePath.replace(/\.json$/, '.html');
        if (!allCollectedByNumber[collected.info.testId]) {
            allCollectedByNumber[collected.info.testId] = [];
            renderedUrlsByNumber[collected.info.testId] = [];
        }
        allCollectedByNumber[collected.info.testId].push(collected);
        renderedUrlsByNumber[collected.info.testId].push(renderedUrl);
    });

    Object.entries(allCollectedByNumber).forEach(([number, allCollected]) => {
        const renderedUrls = renderedUrlsByNumber[number];

        if (
            !deepPickEqual(allCollected, {
                excludeKeys: ['at', 'mode', 'commands']
            })
        ) {
            throw new Error(
                'Difference found in a part of a .collected.json file which ' +
                    'should be equivalent'
            );
        }

        const common = allCollected[0];

        const testId = createTestId(testPlanVersionId, common.info.testId);

        const atIds = allCollected.map(
            collected => ats.find(at => at.name === collected.target.at.name).id
        );

        tests.push({
            id: testId,
            rowNumber: number,
            title: common.info.title,
            atIds,
            atMode: common.target.mode.toUpperCase(),
            renderableContent: Object.fromEntries(
                allCollected.map((collected, index) => {
                    return [atIds[index], collected];
                })
            ),
            renderedUrls: Object.fromEntries(
                atIds.map((atId, index) => {
                    return [
                        atId,
                        getAppUrl(renderedUrls[index], {
                            gitSha,
                            directoryPath: builtDirectoryPath
                        })
                    ];
                })
            ),
            scenarios: (() => {
                const scenarios = [];
                allCollected.forEach(collected => {
                    collected.commands.forEach(command => {
                        scenarios.push({
                            id: createScenarioId(testId, scenarios.length),
                            atId: ats.find(
                                at => at.name === collected.target.at.name
                            ).id,
                            commandIds: command.keypresses.map(({ id }) => id)
                        });
                    });
                });
                return scenarios;
            })(),
            assertions: common.assertions.map((assertion, index) => ({
                id: createAssertionId(testId, index),
                priority: assertion.priority === 1 ? 'REQUIRED' : 'OPTIONAL',
                text: assertion.expectation
            })),
            viewers: []
        });
    });

    return tests;
};

importTestPlanVersions()
    .then(
        () => console.log('Done, no errors'),
        err => {
            console.error(`Error found: ${err.stack}`);
            process.exitCode = 1;
        }
    )
    .finally(() => {
        // Delete temporary files
        fse.removeSync(gitCloneDirectory);
        client.end();
        process.exit();
    });
