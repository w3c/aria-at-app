/* eslint no-console: 0 */

const path = require('path');
const { Client } = require('pg');
const fse = require('fs-extra');
const { pathToFileURL } = require('url');
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
const convertDateToString = require('../../util/convertDateToString');

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
const ariaAtDefaultBranch = 'build-v2-test-format-with-new-csvs';
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

    // const gitCommitDate = new Date();
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

        console.log('sourceDirectoryPath', sourceDirectoryPath);
        // Use existence of assertions.csv to determine if v2 format files exist
        const assertionsCsvPath = path.join(
            sourceDirectoryPath,
            'data',
            'assertions.csv'
        );
        const isV2 = fse.existsSync(assertionsCsvPath);

        const tests = getTests({
            builtDirectoryPath,
            testPlanVersionId,
            ats,
            gitSha,
            isV2
        });

        const hashedTests = hashTests(tests);

        const existing = await getTestPlanVersions('', { hashedTests });

        if (existing.length) continue;

        const { title, exampleUrl, designPatternUrl, testPageUrl } = readCsv({
            sourceDirectoryPath,
            isV2
        });

        let testPlanId = null;
        const associatedTestPlans = await getTestPlans({ directory });

        if (associatedTestPlans.length) {
            testPlanId = associatedTestPlans[0].dataValues.id;
        } else {
            const newTestPlan = await createTestPlan({ title, directory });
            testPlanId = newTestPlan.dataValues.id;
        }

        if (directory === 'alert') console.log('tests', JSON.stringify(tests));

        // Check if any TestPlanVersions exist for the directory and is currently in RD, and set it
        // to DEPRECATED
        const testPlanVersionsToDeprecate = await getTestPlanVersions('', {
            phase: 'RD',
            directory
        });
        if (testPlanVersionsToDeprecate.length) {
            for (const testPlanVersionToDeprecate of testPlanVersionsToDeprecate) {
                if (
                    new Date(testPlanVersionToDeprecate.updatedAt) < updatedAt
                ) {
                    // Set the deprecatedAt time to a couple seconds less than the updatedAt date.
                    // Deprecations happen slightly before update during normal app operations.
                    // This is to maintain correctness and any app sorts issues
                    const deprecatedAt = new Date(updatedAt);
                    deprecatedAt.setSeconds(deprecatedAt.getSeconds() - 60);
                    await updateTestPlanVersion(testPlanVersionToDeprecate.id, {
                        phase: 'DEPRECATED',
                        deprecatedAt
                    });
                }
            }
        }

        const versionString = await getVersionString({ updatedAt, directory });

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
            versionString,
            metadata: {
                designPatternUrl,
                exampleUrl,
                testFormatVersion: isV2 ? 2 : 1
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

const readCsv = ({ sourceDirectoryPath, isV2 }) => {
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
        return columns?.[isV2 ? 2 : 1];
    };

    return {
        title: getCsvValue('title'),
        exampleUrl: getCsvValue('example'),
        designPatternUrl: getCsvValue('designPattern'),
        testPageUrl: getCsvValue('reference')
    };
};

const updateCommandsJson = async () => {
    const keysMjsPath = pathToFileURL(
        path.join(testsDirectory, 'resources', 'keys.mjs')
    );
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

const getVersionString = async ({ directory, updatedAt }) => {
    const versionStringBase = `V${convertDateToString(updatedAt, 'YY.MM.DD')}`;
    const result = await client.query(
        `
            SELECT "versionString" FROM "TestPlanVersion"
            WHERE directory = $1 AND "versionString" LIKE $2
            ORDER BY "versionString" DESC;
        `,
        [directory, `${versionStringBase}%`]
    );

    let versionString = result.rows[0]?.versionString;

    if (!versionString) return versionStringBase;

    const currentCount = versionString.match(/V\d\d\.\d\d\.\d\d-(\d+)/);
    let duplicateCount = currentCount ? Number(currentCount[1]) + 1 : 1;

    return `${versionStringBase}-${duplicateCount}`;
};

const getTests = ({
    builtDirectoryPath,
    testPlanVersionId,
    ats,
    gitSha,
    isV2
}) => {
    const tests = [];
    const renderedUrlsById = {};
    const allCollectedById = {};

    fse.readdirSync(builtDirectoryPath).forEach(filePath => {
        if (!filePath.endsWith('.collected.json')) return;
        const jsonPath = path.join(builtDirectoryPath, filePath);
        const jsonString = fse.readFileSync(jsonPath, 'utf8');
        const collected = JSON.parse(jsonString);
        const renderedUrl = filePath.replace(/\.json$/, '.html');
        if (!allCollectedById[collected.info.testId]) {
            allCollectedById[collected.info.testId] = [];
            renderedUrlsById[collected.info.testId] = [];
        }
        allCollectedById[collected.info.testId].push(collected);
        renderedUrlsById[collected.info.testId].push(renderedUrl);
    });

    Object.entries(allCollectedById).forEach(([rawTestId, allCollected]) => {
        const renderedUrls = renderedUrlsById[rawTestId];

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

        if (isV2) {
            for (const [collectedIndex, collected] of allCollected.entries()) {
                const testId = createTestId(
                    testPlanVersionId,
                    `${collected.target.at.key}:${collected.info.testId}`
                );

                const at = {
                    key: collected.target.at.key,
                    name: collected.target.at.name
                };
                const settings = collected.target.at.settings;
                const atSettings = {
                    [collected.target.at.settings]:
                        collected.target.at.settings === 'defaultMode'
                            ? {
                                  screenText: '',
                                  instructions: []
                              }
                            : {
                                  ...collected.target.at.raw.settings[
                                      collected.target.at.settings
                                  ]
                              }
                };

                // Common representation of renderedUrl
                const renderedUrl = getAppUrl(renderedUrls[collectedIndex], {
                    gitSha,
                    directoryPath: builtDirectoryPath
                });

                // Common representation of commands
                const commands = collected.commands.map(command => ({
                    ...command,
                    settings
                }));

                // Common representation of scenarios
                const scenarios = (() => {
                    const scenarios = [];
                    collected.commands.forEach(command => {
                        scenarios.push({
                            id: createScenarioId(testId, scenarios.length),
                            atId: ats.find(
                                at => at.name === collected.target.at.name
                            ).id,
                            commandIds: command.keypresses.map(({ id }) => id),
                            settings
                        });
                    });
                    return scenarios;
                })();

                // Each mode for AT has to be appended to exists tests[x]
                const testFoundForAt = tests.find(
                    test =>
                        test.at.key === collected.target.at.key &&
                        test.rawTestId === collected.info.testId
                );

                if (testFoundForAt) {
                    testFoundForAt.at.settings[settings] = atSettings;
                    testFoundForAt.renderableContent.target.at.settings[
                        settings
                    ] = atSettings;
                    testFoundForAt.renderableContent.instructions.mode[
                        settings
                    ] = collected.instructions.mode;
                    testFoundForAt.renderableContent.commands.push(...commands);
                    testFoundForAt.renderedUrls[settings] = renderedUrl;
                    testFoundForAt.scenarios.push(...scenarios);
                } else {
                    let test = {
                        id: testId,
                        rawTestId,
                        rowNumber: collected.info.presentationNumber,
                        title: collected.info.title,
                        at: { ...at, settings: atSettings },
                        atIds: [
                            ats.find(at => at.name === collected.target.at.name)
                                .id
                        ],
                        renderableContent: {
                            info: collected.info,
                            target: {
                                at: {
                                    ...collected.target.at.raw,
                                    settings: atSettings
                                },
                                referencePage: collected.target.referencePage,
                                setupScript: collected.target.setupScript
                            },
                            instructions: {
                                instructions:
                                    collected.instructions.instructions,
                                mode: {
                                    [settings]: collected.instructions.mode
                                }
                            },
                            commands,
                            assertions: collected.assertions.map(
                                ({
                                    assertionId,
                                    priority,
                                    assertionStatement,
                                    assertionPhrase,
                                    refIds,
                                    tokenizedAssertionStatements
                                }) => ({
                                    assertionId,
                                    priority,
                                    assertionStatement,
                                    assertionPhrase,
                                    refIds,
                                    tokenizedAssertionStatement:
                                        tokenizedAssertionStatements[
                                            collected.target.at.id
                                        ]
                                })
                            )
                        },
                        renderedUrls: {
                            [settings]: renderedUrl
                        },
                        scenarios,
                        assertions: collected.assertions.map(
                            (assertion, index) => {
                                let priority = '';
                                if (assertion.priority === 1) priority = 'MUST';
                                if (assertion.priority === 2)
                                    priority = 'SHOULD';
                                if (assertion.priority === 3) priority = 'MAY';

                                return {
                                    id: createAssertionId(testId, index),
                                    priority,
                                    assertionStatement:
                                        assertion.assertionStatement,
                                    assertionPhrase: assertion.assertionPhrase
                                };
                            }
                        ),
                        viewers: []
                    };

                    tests.push(test);
                }
            }
        } else {
            const common = allCollected[0];

            const testId = createTestId(testPlanVersionId, common.info.testId);

            const atIds = allCollected.map(
                collected =>
                    ats.find(at => at.name === collected.target.at.name).id
            );

            tests.push({
                id: testId,
                rowNumber: rawTestId,
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
                                commandIds: command.keypresses.map(
                                    ({ id }) => id
                                )
                            });
                        });
                    });
                    return scenarios;
                })(),
                assertions: common.assertions.map((assertion, index) => ({
                    id: createAssertionId(testId, index),
                    priority: assertion.priority === 1 ? 'MUST' : 'SHOULD',
                    text: assertion.expectation
                })),
                viewers: []
            });
        }
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
