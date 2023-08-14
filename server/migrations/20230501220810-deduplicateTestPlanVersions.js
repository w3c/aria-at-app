'use strict';

const fetch = require('node-fetch');
const {
    createTestResultId,
    createScenarioResultId,
    createAssertionResultId
} = require('../services/PopulatedData/locationOfDataId');
const { hashTest, hashTests } = require('../util/aria');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Compute TestPlanVersion.hashedTests and return the unique TestPlanVersions found for each
         * hash
         * @param transaction - The Sequelize.Transaction object.
         * See {@https://sequelize.org/api/v6/class/src/sequelize.js~sequelize#instance-method-transaction}
         * @returns {Promise<{testPlanVersionsByHashedTests: {}}>}
         */
        const computeTestPlanVersionHashedTests = async transaction => {
            const results = await queryInterface.sequelize.query(
                `SELECT COUNT(*) FROM "TestPlanVersion"`,
                { transaction }
            );
            const [[{ count: testPlanVersionCount }]] = results;

            const testPlanVersionBatchSize = 10;
            const iterationsNeeded = Math.ceil(
                testPlanVersionCount / testPlanVersionBatchSize
            );

            let testPlanVersionsByHashedTests = {};

            for (let i = 0; i < iterationsNeeded; i += 1) {
                const multipleOf100 = i % testPlanVersionBatchSize === 0;
                if (multipleOf100)
                    // eslint-disable-next-line no-console
                    console.info(
                        'Indexing TestPlanVersions',
                        i * testPlanVersionBatchSize,
                        'of',
                        Number(testPlanVersionCount)
                    );
                const currentOffset = i * testPlanVersionBatchSize;

                const [testPlanVersions] = await queryInterface.sequelize.query(
                    `SELECT id, directory, "gitSha", tests, "updatedAt" FROM "TestPlanVersion" ORDER BY id LIMIT ? OFFSET ?`,
                    {
                        replacements: [testPlanVersionBatchSize, currentOffset],
                        transaction
                    }
                );

                await Promise.all(
                    testPlanVersions.map(async testPlanVersion => {
                        const hashedTests = hashTests(testPlanVersion.tests);

                        if (!testPlanVersionsByHashedTests[hashedTests]) {
                            testPlanVersionsByHashedTests[hashedTests] = [];
                        }
                        testPlanVersionsByHashedTests[hashedTests].push({
                            id: testPlanVersion.id,
                            gitSha: testPlanVersion.gitSha,
                            directory: testPlanVersion.directory,
                            updatedAt: testPlanVersion.updatedAt
                        });

                        await queryInterface.sequelize.query(
                            `UPDATE "TestPlanVersion" SET "hashedTests" = ? WHERE id = ?`,
                            {
                                replacements: [hashedTests, testPlanVersion.id],
                                transaction
                            }
                        );
                    })
                );
            }

            if (Number(testPlanVersionCount)) {
                // eslint-disable-next-line no-console
                console.info(
                    'Indexed',
                    Number(testPlanVersionCount),
                    'of',
                    Number(testPlanVersionCount)
                );
            }

            return { testPlanVersionsByHashedTests };
        };

        /**
         * Regenerate the testIds, scenarioIds and assertionsIds in TestRun.testResults, for
         * TestRuns that will end up referencing tests from removed TestPlanVersions
         * @param {int[]} equivalentTestPlanVersionIds - A collection of TestPlanVersion ids that
         * have equivalent hashes for their tests
         * @param transaction - The Sequelize.Transaction object.
         * See {@https://sequelize.org/api/v6/class/src/sequelize.js~sequelize#instance-method-transaction}
         * @returns {Promise<void>}
         */
        const regenerateExistingTestResults = async (
            equivalentTestPlanVersionIds,
            transaction
        ) => {
            for (const key in equivalentTestPlanVersionIds) {
                const [keptId, ...unkeptIds] =
                    equivalentTestPlanVersionIds[key];

                if (!unkeptIds.length) continue;

                // Iterate through all the TestPlanReports using unkept TestPlanVersion ids
                // and update the TestRun.testResults information from the TestPlanVersion
                // keptId
                const unkeptTestPlanReports =
                    await queryInterface.sequelize.query(
                        `SELECT id, "testPlanVersionId" FROM "TestPlanReport" WHERE "testPlanVersionId" IN (?)`,
                        {
                            replacements: [unkeptIds],
                            type: Sequelize.QueryTypes.SELECT,
                            transaction
                        }
                    );

                const keptTestPlanVersion =
                    await queryInterface.sequelize.query(
                        `SELECT id, tests FROM "TestPlanVersion" WHERE id = ?`,
                        {
                            replacements: [keptId],
                            type: Sequelize.QueryTypes.SELECT,
                            transaction
                        }
                    );
                const { tests: keptTestPlanVersionTests } =
                    keptTestPlanVersion[0];

                // Iterate over all the TestPlanRuns using unkeptIds to update their
                // testResults ids
                for (const key in unkeptTestPlanReports) {
                    const { id: testPlanReportId } = unkeptTestPlanReports[key];

                    const testPlanRuns = await queryInterface.sequelize.query(
                        `SELECT testPlanRun.id, "testPlanReportId", "atId", "testPlanVersionId", "testResults", tests
                                 FROM "TestPlanRun" testPlanRun
                                          JOIN "TestPlanReport" testPlanReport ON testPlanReport.id = testPlanRun."testPlanReportId"
                                          JOIN "TestPlanVersion" testPlanVersion ON testPlanVersion.id = testPlanReport."testPlanVersionId"
                                 WHERE "testPlanReportId" = ?`,
                        {
                            replacements: [testPlanReportId],
                            type: Sequelize.QueryTypes.SELECT,
                            transaction
                        }
                    );

                    for (const key in testPlanRuns) {
                        const {
                            id: testPlanRunId,
                            atId,
                            testResults,
                            tests: unkeptTests
                        } = testPlanRuns[key];

                        unkeptTests.forEach(unkeptTest => {
                            const unkeptTestId = unkeptTest.id;
                            const testHash = hashTest(unkeptTest);
                            const foundKeptTest = keptTestPlanVersionTests.find(
                                keptTest => hashTest(keptTest) === testHash
                            );

                            testResults.forEach(testResult => {
                                if (testResult.testId === unkeptTestId) {
                                    // Reassign the ids the testResult should be using
                                    testResult.testId = foundKeptTest.id;

                                    // Update testResult.id
                                    const testResultId = createTestResultId(
                                        testPlanRunId,
                                        testResult.testId
                                    );
                                    testResult.id = testResultId;

                                    // The hash confirms the sub-arrays should be in the same order
                                    testResult.scenarioResults.forEach(
                                        (eachScenarioResult, scenarioIndex) => {
                                            eachScenarioResult.scenarioId =
                                                foundKeptTest.scenarios.filter(
                                                    scenario =>
                                                        scenario.atId === atId
                                                )[scenarioIndex].id;

                                            // Update eachScenarioResult.id
                                            const scenarioResultId =
                                                createScenarioResultId(
                                                    testResultId,
                                                    eachScenarioResult.scenarioId
                                                );
                                            eachScenarioResult.id =
                                                scenarioResultId;

                                            eachScenarioResult.assertionResults.forEach(
                                                (
                                                    eachAssertionResult,
                                                    assertionIndex
                                                ) => {
                                                    eachAssertionResult.assertionId =
                                                        foundKeptTest.assertions[
                                                            assertionIndex
                                                        ].id;

                                                    // Update eachAssertionResult.id
                                                    eachAssertionResult.id =
                                                        createAssertionResultId(
                                                            scenarioResultId,
                                                            eachAssertionResult.assertionId
                                                        );
                                                }
                                            );
                                        }
                                    );
                                }
                            });
                        });

                        await queryInterface.sequelize.query(
                            `UPDATE "TestPlanRun" SET "testResults" = ? WHERE id = ?`,
                            {
                                replacements: [
                                    JSON.stringify(testResults),
                                    testPlanRunId
                                ],
                                transaction
                            }
                        );
                        // eslint-disable-next-line no-console
                        console.info(
                            'Fixing testResults for TestPlanRun',
                            testPlanRunId
                        );
                    }
                }
            }
        };

        /**
         * Remove duplicate versions of found TestPlanVersions
         * @param {int[]} equivalentTestPlanVersionIds - A collection of TestPlanVersion ids that
         * have equivalent hashes for their tests
         * @param transaction - The Sequelize.Transaction object.
         * See {@https://sequelize.org/api/v6/class/src/sequelize.js~sequelize#instance-method-transaction}
         * @returns {Promise<void>}
         */
        const removeTestPlanVersionDuplicates = async (
            equivalentTestPlanVersionIds,
            transaction
        ) => {
            await Promise.all(
                equivalentTestPlanVersionIds.map(
                    async ([keptId, ...unkeptIds]) => {
                        if (!unkeptIds.length) return;
                        await queryInterface.sequelize.query(
                            `UPDATE "TestPlanReport" SET "testPlanVersionId" = ? WHERE "testPlanVersionId" IN (?)`,
                            {
                                replacements: [keptId, unkeptIds],
                                transaction
                            }
                        );
                    }
                )
            );

            const duplicateIds = equivalentTestPlanVersionIds
                .map(ids => ids.slice(1))
                .flat();

            if (duplicateIds.length)
                await queryInterface.sequelize.query(
                    `DELETE FROM "TestPlanVersion" WHERE id IN (?)`,
                    {
                        replacements: [duplicateIds],
                        transaction
                    }
                );
        };

        /**
         * Returns an object using test directories as the key, which holds an array containing data
         * on the known commits.
         * Example:
         * {
         *   alert: [ { sha: 'string', commitDate: 'dateString' }, { sha: ..., commitDate: ... }, ... ],
         *   banner: [ { sha: 'string', commitDate: 'dateString' }, ... ],
         *   ...
         * }
         * @returns {Promise<{}>}
         */
        const getKnownGitCommits = async () => {
            const testDirectories = [
                'alert',
                'banner',
                'breadcrumb',
                'checkbox',
                'checkbox-tri-state',
                'combobox-autocomplete-both-updated',
                'combobox-select-only',
                'command-button',
                'complementary',
                'contentinfo',
                'datepicker-spin-button',
                'disclosure-faq',
                'disclosure-navigation',
                'form',
                'horizontal-slider',
                'link-css',
                'link-img-alt',
                'link-span-text',
                'main',
                'menu-button-actions',
                'menu-button-actions-active-descendant',
                'menu-button-navigation',
                'menubar-editor',
                'meter',
                'minimal-data-grid',
                'modal-dialog',
                'radiogroup-aria-activedescendant',
                'radiogroup-roving-tabindex',
                'rating-slider',
                'seek-slider',
                'slider-multithumb',
                'switch',
                'tabs-manual-activation',
                'toggle-button',
                'vertical-temperature-slider'
            ];
            const knownGitCommits = {};

            const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;

            for (const testDirectory of testDirectories) {
                if (!knownGitCommits[testDirectory])
                    knownGitCommits[testDirectory] = [];

                try {
                    const url = `https://api.github.com/repos/w3c/aria-at/commits?path=tests/${testDirectory}`;
                    const authorizationHeader = `Basic ${Buffer.from(
                        `${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}`
                    ).toString('base64')}`;
                    const options = {
                        headers: {
                            Authorization: authorizationHeader
                        }
                    };

                    const response = await fetch(url, options);
                    const data = await response.json();

                    for (const commitData of data) {
                        if (commitData.commit?.author) {
                            knownGitCommits[testDirectory].push({
                                sha: commitData.sha,
                                commitDate: commitData.commit.author.date
                            });
                        }
                    }

                    // eslint-disable-next-line no-console
                    console.info(
                        `Processed GitHub API commits history for tests/${testDirectory}`
                    );
                } catch (error) {
                    console.error(
                        'get.commits.error',
                        testDirectory,
                        error.message
                    );
                }
            }

            return knownGitCommits;
        };

        /**
         * Determines the TestPlanVersions which can be kept or removed.
         * @param testPlanVersionsByHashedTests - TestPlanVersions separated by hashedTests
         * @param knownGitCommits - Ideally, the result of {@link getKnownGitCommits}
         * @returns {{testPlanVersionIdsByHashedTests: {}, testPlanVersionIdsByHashedTestsToKeep: {}, testPlanVersionIdsByHashedTestsToDelete: {}}}
         */
        const processTestPlanVersionIdsByHashedTests = (
            testPlanVersionsByHashedTests,
            knownGitCommits
        ) => {
            for (const directory in knownGitCommits) {
                const gitCommits = knownGitCommits[directory];

                // Get the testPlanVersions filtered by the directory to compare against the git
                // commits data
                const filteredTestPlanVersionsByHashedTestsForDirectory =
                    Object.fromEntries(
                        Object.entries(testPlanVersionsByHashedTests).filter(
                            // eslint-disable-next-line no-unused-vars
                            ([key, arr]) =>
                                arr.some(obj => obj.directory === directory)
                        )
                    );

                // Sort the array for each hash object so the latest date is preferred when
                // assigning the isPriority flag
                for (const hash in filteredTestPlanVersionsByHashedTestsForDirectory) {
                    filteredTestPlanVersionsByHashedTestsForDirectory[
                        hash
                    ].sort((a, b) => {
                        const dateA = new Date(a.updatedAt);
                        const dateB = new Date(b.updatedAt);
                        return dateB - dateA;
                    });
                }

                for (const gitCommit of gitCommits) {
                    const { sha } = gitCommit;
                    for (const hash in filteredTestPlanVersionsByHashedTestsForDirectory) {
                        for (const testPlanVersion of filteredTestPlanVersionsByHashedTestsForDirectory[
                            hash
                        ]) {
                            // Check if the found commit is the same git sha
                            if (sha === testPlanVersion.gitSha) {
                                if (
                                    !testPlanVersionsByHashedTests[hash].some(
                                        obj => obj.isPriority
                                    )
                                )
                                    testPlanVersionsByHashedTests[hash].find(
                                        obj => obj.id === testPlanVersion.id
                                    ).isPriority = true;
                            }
                        }
                    }
                }
            }

            for (const key in testPlanVersionsByHashedTests) {
                testPlanVersionsByHashedTests[key]
                    .sort((a, b) => {
                        const dateA = new Date(a.updatedAt);
                        const dateB = new Date(b.updatedAt);
                        return dateA - dateB;
                    })
                    .sort((a, b) => {
                        return a.isPriority ? -1 : b.isPriority ? 1 : 0;
                    });
            }

            const batchesWIsPriority = {};
            const batchesWOIsPriority = {};

            for (const hash in testPlanVersionsByHashedTests) {
                const batch = testPlanVersionsByHashedTests[hash];

                if (batch.some(testPlanVersion => testPlanVersion.isPriority)) {
                    batchesWIsPriority[hash] = batch;
                } else {
                    batchesWOIsPriority[hash] = batch;
                }
            }

            const getTestPlanVersionIdsByHashedTests = data => {
                const getIdsFromKey = key => {
                    return data[key].map(item => item.id);
                };

                // Get the ids for each key
                const idsByKeys = {};
                Object.keys(data).forEach(key => {
                    idsByKeys[key] = getIdsFromKey(key);
                });

                return idsByKeys;
            };

            const testPlanVersionIdsByHashedTests =
                getTestPlanVersionIdsByHashedTests(
                    testPlanVersionsByHashedTests
                );
            const testPlanVersionIdsByHashedTestsToKeep =
                getTestPlanVersionIdsByHashedTests(batchesWIsPriority);
            const testPlanVersionIdsByHashedTestsToDelete =
                getTestPlanVersionIdsByHashedTests(batchesWOIsPriority);

            return {
                testPlanVersionIdsByHashedTests,
                testPlanVersionIdsByHashedTestsToKeep,
                testPlanVersionIdsByHashedTestsToDelete
            };
        };

        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanVersion',
                'hashedTests',
                { type: Sequelize.DataTypes.TEXT },
                { transaction }
            );

            // Get the unique TestPlanVersions found for each hash
            const { testPlanVersionsByHashedTests } =
                await computeTestPlanVersionHashedTests(transaction);

            const uniqueHashCount = Object.keys(
                testPlanVersionsByHashedTests
            ).length;
            const testPlanReportsBatchSize = 100;
            const iterationsNeeded = Math.ceil(
                uniqueHashCount / testPlanReportsBatchSize
            );

            // Retrieve the latest known git commits info for each test plan directory
            const knownGitCommits = await getKnownGitCommits();

            const {
                testPlanVersionIdsByHashedTests,
                testPlanVersionIdsByHashedTestsToDelete
            } = processTestPlanVersionIdsByHashedTests(
                testPlanVersionsByHashedTests,
                knownGitCommits
            );

            const testPlanVersionIdsToDelete = Object.values(
                testPlanVersionIdsByHashedTestsToDelete
            );

            for (let i = 0; i < iterationsNeeded; i += 1) {
                // eslint-disable-next-line no-console
                console.info(
                    'Fixing TestPlanReports',
                    i * testPlanReportsBatchSize,
                    'of',
                    uniqueHashCount
                );

                const offset = i * testPlanReportsBatchSize;
                const equivalentIds = Object.values(
                    testPlanVersionIdsByHashedTests
                ).slice(
                    offset,
                    Math.min(offset + testPlanReportsBatchSize, uniqueHashCount)
                );

                // Regenerate the testIds, scenarioIds and assertionsIds in TestRun.testResults
                await regenerateExistingTestResults(equivalentIds, transaction);

                await removeTestPlanVersionDuplicates(
                    equivalentIds,
                    transaction
                );
            }

            // Remove the TestPlanVersions not captured by removeTestPlanVersionDuplicates()
            if (testPlanVersionIdsToDelete.length) {
                // Update TestPlanVersion -> TestPlanReport fkey to add cascade deletion on
                // TestPlanVersion row deletion
                await queryInterface.sequelize.query(
                    `alter table "TestPlanReport"
                            drop constraint "TestPlanReport_testPlan_fkey";

                         alter table "TestPlanReport"
                            add constraint "TestPlanReport_testPlan_fkey" foreign key ("testPlanVersionId") references "TestPlanVersion" on update cascade on delete cascade;`,
                    {
                        transaction
                    }
                );

                const toRemove = testPlanVersionIdsToDelete.flat();
                await queryInterface.sequelize.query(
                    `DELETE FROM "TestPlanVersion" WHERE id IN (?)`,
                    {
                        replacements: [toRemove],
                        transaction
                    }
                );

                // Update TestPlanVersion -> TestPlanReport fkey to remove cascade delete on
                // TestPlanVersion row deletion
                await queryInterface.sequelize.query(
                    `alter table "TestPlanReport"
                            drop constraint "TestPlanReport_testPlan_fkey";

                         alter table "TestPlanReport"
                            add constraint "TestPlanReport_testPlan_fkey" foreign key ("testPlanVersionId") references "TestPlanVersion" on update cascade;`,
                    {
                        transaction
                    }
                );

                if (uniqueHashCount) {
                    // eslint-disable-next-line no-console
                    console.info(
                        'Fixed',
                        uniqueHashCount - testPlanVersionIdsToDelete.length,
                        'of',
                        uniqueHashCount - testPlanVersionIdsToDelete.length
                    );
                }
            } else if (uniqueHashCount) {
                // eslint-disable-next-line no-console
                console.info('Fixed', uniqueHashCount, 'of', uniqueHashCount);
            }

            await queryInterface.changeColumn(
                'TestPlanVersion',
                'hashedTests',
                {
                    type: Sequelize.DataTypes.TEXT,
                    allowNull: false,
                    unique: true
                },
                { transaction }
            );
        });
    },

    async down(queryInterface /* , Sequelize */) {
        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn(
                'TestPlanVersion',
                'hashedTests',
                { transaction }
            );
        });
    }
};
