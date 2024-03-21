const unexpectedBehaviorsJson = require('../../resources/unexpectedBehaviors.json');
const getTests = require('./TestsService');
const deepCustomMerge = require('../../util/deepCustomMerge');

/**
 * Returns an array of test results with nested test, atVersion, browserVersion,
 * scenario, assertion and unexpectedBehavior fields populated.
 * @param {Object} testPlanRun
 * @param {Object} testPlanRun.testPlanReport
 * @param {Object[]} testPlanRun.testResults
 * @param {Object} context
 * @param {*} context.browserLoader
 * @param {*} context.atLoader
 * @param {*} context.transaction - Sequelize transaction
 * @returns {Promise<Object[]>}
 */
const getTestResults = async ({ testPlanRun, context }) => {
    const { atLoader, browserLoader, transaction } = context;

    const { testPlanReport } = testPlanRun;
    const tests = getTests(testPlanReport);
    const ats = await atLoader.getAll({ transaction });
    const browsers = await browserLoader.getAll({ transaction });

    // Populate nested test, atVersion, browserVersion, scenario, assertion and
    // unexpectedBehavior fields
    return testPlanRun.testResults.map(testResult => {
        const test = tests.find(each => each.id === testResult.testId);
        return {
            ...testResult,
            test,
            atVersion: ats
                .find(at => at.id === testPlanReport.at.id)
                .atVersions.find(each => each.id == testResult.atVersionId),
            browserVersion: browsers
                .find(browser => browser.id === testPlanReport.browser.id)
                .browserVersions.find(
                    each => each.id == testResult.browserVersionId
                ),
            scenarioResults: testResult.scenarioResults.map(scenarioResult => ({
                ...scenarioResult,
                scenario: test.scenarios.find(
                    each => each.id === scenarioResult.scenarioId
                ),
                assertionResults: scenarioResult.assertionResults.map(
                    assertionResult => ({
                        ...assertionResult,
                        assertion: test.assertions.find(
                            each => each.id === assertionResult.assertionId
                        )
                    })
                ),
                unexpectedBehaviors: scenarioResult.unexpectedBehaviors?.map(
                    unexpectedBehavior => ({
                        ...unexpectedBehavior,
                        text: unexpectedBehaviorsJson.find(
                            each => each.id === unexpectedBehavior.id
                        ).text
                    })
                )
            }))
        };
    });
};

/**
 * Returns an array of finalized test results with nested test, atVersion,
 * browserVersion, scenario, assertion and unexpectedBehavior fields populated.
 * @param {Object} testPlanReport
 * @param {Object[]} testPlanReport.testPlanRuns
 * @param {Object} context - GraphQL context
 * @returns {Promise<Object[]>}
 */
const getFinalizedTestResults = ({ testPlanReport, context }) => {
    if (!testPlanReport.testPlanRuns.length) {
        return null;
    }

    let merged = [];

    for (let i = 0; i < testPlanReport.testPlanRuns.length; i += 1) {
        merged = deepCustomMerge(
            merged,
            testPlanReport.testPlanRuns[i].testResults.filter(
                testResult => !!testResult.completedAt
            ),
            {
                identifyArrayItem: item =>
                    item.testId ?? item.scenarioId ?? item.assertionId
            }
        );
    }
    return getTestResults({
        testPlanRun: { testPlanReport, testResults: merged },
        context
    });
};

module.exports = {
    getTestResults,
    getFinalizedTestResults
};
