const { Sequelize } = require('sequelize');
const {
    createTestResultId,
    createScenarioResultId,
    createAssertionResultId
} = require('../../services/PopulatedData/locationOfDataId');
const { hashTests } = require('../../util/aria');

/**
 * Recompute TestPlanVersion.hashedTests
 * @param queryInterface - The Sequelize.QueryInterface object.
 * @param transaction - The Sequelize.Transaction object.
 * @param testPlanVersionWhere - Additional WHERE clauses when querying TestPlanVersion if needed
 * See {@https://sequelize.org/api/v6/class/src/sequelize.js~sequelize#instance-method-transaction}
 * @returns {Promise<void>}
 */
const computeTestPlanVersionHashedTests = async (
    queryInterface,
    transaction,
    testPlanVersionWhere
) => {
    const results = await queryInterface.sequelize.query(
        `SELECT COUNT(*) FROM "TestPlanVersion" ${testPlanVersionWhere}`,
        { transaction }
    );
    const [[{ count: testPlanVersionCount }]] = results;

    const testPlanVersionBatchSize = 10;
    const iterationsNeeded = Math.ceil(
        testPlanVersionCount / testPlanVersionBatchSize
    );

    const knownHashedTests = [];
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
            `SELECT id, directory, "gitSha", tests, "updatedAt" FROM "TestPlanVersion" ${testPlanVersionWhere} ORDER BY id LIMIT ? OFFSET ?`,
            {
                replacements: [testPlanVersionBatchSize, currentOffset],
                transaction
            }
        );

        await Promise.all(
            testPlanVersions.map(async testPlanVersion => {
                const hashedTests = hashTests(testPlanVersion.tests);

                if (!knownHashedTests.includes(hashedTests)) {
                    knownHashedTests.push(hashedTests);
                    await queryInterface.sequelize.query(
                        `UPDATE "TestPlanVersion" SET "hashedTests" = ? WHERE id = ?`,
                        {
                            replacements: [hashedTests, testPlanVersion.id],
                            transaction
                        }
                    );
                } else {
                    // Remove any accidentally created TestPlanVersion rows created prior to migration
                    await queryInterface.sequelize.query(
                        `DELETE FROM "TestPlanVersion" WHERE id = ?`,
                        {
                            replacements: [testPlanVersion.id],
                            transaction
                        }
                    );
                }
            })
        );
    }
};

/**
 * Regenerate the testIds, scenarioIds and assertionsIds in TestRun.testResults, for
 * TestRuns
 * @param queryInterface - The Sequelize.QueryInterface object.
 * @param transaction - The Sequelize.Transaction object.
 * @param testPlanVersionWhere - Additional WHERE clauses when querying TestPlanVersion if needed
 * See {@https://sequelize.org/api/v6/class/src/sequelize.js~sequelize#instance-method-transaction}
 * @returns {Promise<void>}
 */
const regenerateExistingTestResults = async (
    queryInterface,
    transaction,
    testPlanVersionWhere
) => {
    const testPlanVersions = await queryInterface.sequelize.query(
        `SELECT id, tests FROM "TestPlanVersion" ${testPlanVersionWhere}`,
        {
            type: Sequelize.QueryTypes.SELECT,
            transaction
        }
    );

    if (testPlanVersions.length) {
        const testPlanReports = await queryInterface.sequelize.query(
            `select id, "testPlanVersionId"
                     from "TestPlanReport"
                     where "testPlanVersionId" in (?)`,
            {
                replacements: [testPlanVersions.map(e => e.id)],
                type: Sequelize.QueryTypes.SELECT,
                transaction
            }
        );

        for (const key in testPlanReports) {
            const { id: testPlanReportId } = testPlanReports[key];

            const testPlanRuns = await queryInterface.sequelize.query(
                `select testPlanRun.id, "testPlanReportId", "atId", "testPlanVersionId", "testResults", tests
                         from "TestPlanRun" testPlanRun
                                  join "TestPlanReport" testPlanReport
                                       on testPlanReport.id = testPlanRun."testPlanReportId"
                                  join "TestPlanVersion" testPlanVersion
                                       on testPlanVersion.id = testPlanReport."testPlanVersionId"
                         where "testPlanReportId" = ?`,
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
                    tests
                } = testPlanRuns[key];

                tests.forEach(test => {
                    const testId = test.id;

                    testResults.forEach(testResult => {
                        if (testResult.testId === testId) {
                            // Update testResult.id
                            const testResultId = createTestResultId(
                                testPlanRunId,
                                testResult.testId
                            );
                            testResult.id = testResultId;

                            // The sub-arrays should be in the same order
                            testResult.scenarioResults.forEach(
                                (eachScenarioResult, scenarioIndex) => {
                                    eachScenarioResult.scenarioId =
                                        test.scenarios.filter(
                                            scenario => scenario.atId === atId
                                        )[scenarioIndex].id;

                                    // Update eachScenarioResult.id
                                    const scenarioResultId =
                                        createScenarioResultId(
                                            testResultId,
                                            eachScenarioResult.scenarioId
                                        );
                                    eachScenarioResult.id = scenarioResultId;

                                    eachScenarioResult.assertionResults.forEach(
                                        (
                                            eachAssertionResult,
                                            assertionIndex
                                        ) => {
                                            eachAssertionResult.assertionId =
                                                test.assertions[
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
                    `update "TestPlanRun"
                             set "testResults" = ?
                             where id = ?`,
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
 * Regenerate the testIds, scenarioIds and assertionsIds in TestRun.testResults, for
 * TestRuns and regenerates TestPlanVersion.hashedTests if required
 * @param queryInterface - The Sequelize.QueryInterface object.
 * @param transaction - The Sequelize.Transaction object.
 * @param testPlanVersionWhere - Additional WHERE clauses when querying TestPlanVersion if needed
 * See {@https://sequelize.org/api/v6/class/src/sequelize.js~sequelize#instance-method-transaction}
 * @returns {Promise<void>}
 */
const regenerateResultsAndRecalculateHashes = async (
    queryInterface,
    transaction,
    testPlanVersionWhere = ''
) => {
    await computeTestPlanVersionHashedTests(
        queryInterface,
        transaction,
        testPlanVersionWhere
    );

    await regenerateExistingTestResults(
        queryInterface,
        transaction,
        testPlanVersionWhere
    );
};

module.exports = {
    regenerateResultsAndRecalculateHashes
};
