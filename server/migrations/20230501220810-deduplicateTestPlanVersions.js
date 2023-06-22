'use strict';

const { omit } = require('lodash');
const objectHash = require('object-hash');
const {
    createTestResultId,
    createScenarioResultId,
    createAssertionResultId
} = require('../services/PopulatedData/locationOfDataId');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Should be identical to the hash function used in the import script
        const hashTests = tests => {
            return objectHash(
                tests.map(test => ({
                    ...omit(test, ['id', 'renderedUrls']),
                    assertions: test.assertions.map(assertion => ({
                        ...omit(assertion, ['id'])
                    })),
                    scenarios: test.scenarios.map(scenario => ({
                        ...omit(scenario, ['id'])
                    }))
                }))
            );
        };

        const hashTest = test => {
            return objectHash({
                ...omit(test, ['id', 'renderedUrls']),
                assertions: test.assertions.map(assertion => ({
                    ...omit(assertion, ['id'])
                })),
                scenarios: test.scenarios.map(scenario => ({
                    ...omit(scenario, ['id'])
                }))
            });
        };

        return queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(
                'TestPlanVersion',
                'hashedTests',
                { type: Sequelize.DataTypes.TEXT },
                { transaction }
            );

            const results = await queryInterface.sequelize.query(
                `SELECT COUNT(*) FROM "TestPlanVersion"`,
                { transaction }
            );
            const [[{ count: testPlanVersionCount }]] = results;

            const iterationsNeeded = Math.ceil(testPlanVersionCount / 10);

            let testPlanVersionIdsByHashedTests = {};

            for (let i = 0; i < iterationsNeeded; i += 1) {
                const multipleOf100 = i % 10 === 0;
                if (multipleOf100)
                    // eslint-disable-next-line no-console
                    console.info(
                        'Indexing',
                        i * 10,
                        'of',
                        Number(testPlanVersionCount)
                    );
                const currentOffset = i * 10;

                const [testPlanVersions] = await queryInterface.sequelize.query(
                    `SELECT id, tests FROM "TestPlanVersion" ORDER BY id LIMIT 10 OFFSET ?`,
                    { replacements: [currentOffset], transaction }
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

            const uniqueHashCount = Object.keys(
                testPlanVersionIdsByHashedTests
            ).length;

            const batchCount = 100;
            const iterationsNeeded2 = Math.ceil(uniqueHashCount / batchCount);

            for (let i = 0; i < iterationsNeeded2; i += 1) {
                // eslint-disable-next-line no-console
                console.info('Fixing', i * batchCount, 'of', uniqueHashCount);

                const offset = i * batchCount;
                const equivalentIds = Object.values(
                    testPlanVersionIdsByHashedTests
                ).slice(
                    offset,
                    offset + 100 < uniqueHashCount
                        ? offset + 100
                        : uniqueHashCount
                );

                for (const key in equivalentIds) {
                    const [keptId, ...unkeptIds] = equivalentIds[key];

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
                            `SELECT id, tests FROM "TestPlanVersion" WHERE id = ? LIMIT 1`,
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
                        const { id: testPlanReportId } =
                            unkeptTestPlanReports[key];

                        const testPlanRuns =
                            await queryInterface.sequelize.query(
                                `SELECT testPlanRun.id, "testPlanReportId", "testResults", "testPlanVersionId", tests
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
                                testResults,
                                tests: unkeptTests
                            } = testPlanRuns[key];

                            unkeptTests.forEach(unkeptTest => {
                                const unkeptTestId = unkeptTest.id;
                                const testHash = hashTest(unkeptTest);
                                const foundKeptTest =
                                    keptTestPlanVersionTests.find(
                                        keptTest =>
                                            hashTest(keptTest) === testHash
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
                                            (
                                                eachScenarioResult,
                                                scenarioIndex
                                            ) => {
                                                eachScenarioResult.scenarioId =
                                                    foundKeptTest.scenarios[
                                                        scenarioIndex
                                                    ].id;

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
                                'Updated testResults (testIds, scenarioIds, assertionsIds) for TestPlanRun',
                                testPlanRunId
                            );
                        }
                    }
                }

                await Promise.all(
                    equivalentIds.map(async ([keptId, ...unkeptIds]) => {
                        if (!unkeptIds.length) return;
                        await queryInterface.sequelize.query(
                            `UPDATE "TestPlanReport" SET "testPlanVersionId" = ? WHERE "testPlanVersionId" IN (?)`,
                            {
                                replacements: [keptId, unkeptIds],
                                transaction
                            }
                        );
                    })
                );

                const duplicateIds = equivalentIds
                    .map(ids => ids.slice(1))
                    .flat();

                await queryInterface.sequelize.query(
                    `DELETE FROM "TestPlanVersion" WHERE id IN (?)`,
                    {
                        replacements: [duplicateIds],
                        transaction
                    }
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
