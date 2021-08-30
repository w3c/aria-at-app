const testResultsResolver = testPlanRun => {
    const tests = testPlanRun.testPlanReport.testPlanVersion.tests;
    const testResults = testPlanRun.testResults;

    // Populate nested test, scenario and assertion fields
    return testResults.map(testResult => {
        const test = tests.find(each => each.id === testResult.testId);
        return {
            ...testResult,
            test,
            scenarioResults: testResult.scenarioResults(scenarioResult => ({
                ...scenarioResult,
                scenario: test.scenarios.find(
                    each => each.id === scenarioResult.scenarioId
                ),
                assertionResults: scenarioResult.assertionResults(
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
