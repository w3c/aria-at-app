const { At } = require('../../models');
const { remapTest } = require('../../scripts/import-tests/remapTest');
const {
    getRemapTestResultContext,
    remapTestResults
} = require('../../scripts/import-tests/remapTestResults');

const testResultsResolver = async testPlanRun => {
    // TODO: run this remapping before saving to database
    const allAts = await At.findAll();
    const testPlanVersion = testPlanRun.testPlanReport.testPlanVersion;
    const tests = testPlanVersion.tests.map(test =>
        remapTest(test, { testPlanVersionId: testPlanVersion.id, allAts })
    );
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
