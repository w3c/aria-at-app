'use strict';

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
         * @returns {Promise<{testPlanVersionIdsByHashedTests: {}}>}
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

            let testPlanVersionIdsByHashedTests = {};

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
                    `SELECT id, tests FROM "TestPlanVersion" ORDER BY id LIMIT ? OFFSET ?`,
                    {
                        replacements: [testPlanVersionBatchSize, currentOffset],
                        transaction
                    }
                );

                await Promise.all(
                    testPlanVersions.map(async testPlanVersion => {
                        const hashedTests = hashTests(testPlanVersion.tests);

                        if (!testPlanVersionIdsByHashedTests[hashedTests]) {
                            testPlanVersionIdsByHashedTests[hashedTests] = [];
                        }
                        testPlanVersionIdsByHashedTests[hashedTests].push(
                            testPlanVersion.id
                        );

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

            return { testPlanVersionIdsByHashedTests };
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

        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanVersion',
                'hashedTests',
                { type: Sequelize.DataTypes.TEXT },
                { transaction }
            );

            // Get the unique TestPlanVersions found for each hash
            const { testPlanVersionIdsByHashedTests } =
                await computeTestPlanVersionHashedTests(transaction);

            const uniqueHashCount = Object.keys(
                testPlanVersionIdsByHashedTests
            ).length;
            const testPlanReportsBatchSize = 100;
            const iterationsNeeded = Math.ceil(
                uniqueHashCount / testPlanReportsBatchSize
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

            if (uniqueHashCount) {
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
