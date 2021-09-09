const { At } = require('../../models');
const {
    getRemapTestResultContext,
    remapTestResults
} = require('../../scripts/import-tests/remapTestResults');
const testsResolver = require('../TestPlanVersion/testsResolver');

const testResultsResolver = async testPlanRun => {
    const testPlanVersion = testPlanRun.testPlanReport.testPlanVersion;
    const tests = await testsResolver(testPlanVersion);

    // TODO: run this remapping before saving to database
    const allAts = await At.findAll();
    const testResultContext = await getRemapTestResultContext({
        testPlanVersion,
        testPlanRun,
        tests,
        allAts
    });
    const testResults = remapTestResults(
        testPlanRun.testResults,
        testResultContext
    );

    // Populate nested test, scenario and assertion fields
    return testResults.map(testResult => {
        const test = tests.find(each => each.id === testResult.testId);
        return {
            ...testResult,
            test,
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
                )
            }))
        };
    });
};

module.exports = testResultsResolver;
