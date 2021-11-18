/* eslint no-console: 0 */

const path = require('path');
const nodegit = require('nodegit');
const { Client } = require('pg');
const fse = require('fs-extra');
const { At } = require('../../models');
const {
    createTestPlanVersion,
    getTestPlanVersions
} = require('../../models/services/TestPlanVersionService');
const {
    createTestId,
    createScenarioId,
    createAssertionId
} = require('../../services/PopulatedData/locationOfDataId');
const deepPickEqual = require('../../util/deepPickEqual');

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
const gitCloneDirectory = path.resolve(__dirname, 'tmp');
const builtTestsDirectory = path.resolve(gitCloneDirectory, 'build', 'tests');
const testsDirectory = path.resolve(gitCloneDirectory, 'tests');

const importTestPlanVersions = async () => {
    await client.connect();

    const { gitCommitDate, gitMessage, gitSha } = await readRepo();

    const ats = await At.findAll();
    await updateAtsJson(ats);

    await updateCommandsJson();

    for (const directory of fse.readdirSync(builtTestsDirectory)) {
        if (directory === 'resources') continue;

        const builtDirectoryPath = path.join(builtTestsDirectory, directory);
        const sourceDirectoryPath = path.join(testsDirectory, directory);

        if (
            !(
                fse.existsSync(sourceDirectoryPath) &&
                fse.statSync(builtDirectoryPath).isDirectory()
            )
        ) {
            continue;
        }

        const existing = await getTestPlanVersions('', {
            directory,
            gitSha
        });

        if (existing.length) continue;

        // Gets the next ID and increments the ID counter in Postgres
        // Needed to create the testIds - see LocationOfDataId.js for more info
        const testPlanVersionId = (
            await client.query(
                `SELECT nextval(
                    pg_get_serial_sequence('"TestPlanVersion"', 'id')
                )`
            )
        ).rows[0].nextval;

        const { title, exampleUrl, designPatternUrl, testPageUrl } = readCsv({
            sourceDirectoryPath
        });

        const tests = getTests({
            builtDirectoryPath,
            testPlanVersionId,
            ats,
            gitSha
        });

        await createTestPlanVersion({
            id: testPlanVersionId,
            title,
            directory,
            testPageUrl: getAppUrl(testPageUrl, { gitSha, builtDirectoryPath }),
            gitSha,
            gitMessage,
            updatedAt: gitCommitDate,
            metadata: {
                designPatternUrl,
                exampleUrl
            },
            tests
        });
    }
};

const readRepo = async () => {
    fse.ensureDirSync(gitCloneDirectory);
    let repo = await nodegit.Clone(ariaAtRepo, gitCloneDirectory, {});
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
                    gitCloneDirectory,
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

    return {
        gitCommitDate: commit.date(),
        gitMessage: commit.message(),
        gitSha: commit.id().tostrS()
    };
};

const getAppUrl = (directoryRelativePath, { gitSha, builtDirectoryPath }) => {
    return path.join(
        '/',
        'aria-at', // The app's proxy to the ARIA-AT repo
        gitSha,
        path.relative(
            gitCloneDirectory,
            path.join(builtDirectoryPath, directoryRelativePath)
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

    const commands = Object.entries(
        await import(keysMjsPath)
    ).map(([id, text]) => ({ id, text }));

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
                            builtDirectoryPath
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
            }))
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
