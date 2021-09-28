const testsResolver = require('../TestPlanVersion/testsResolver');
const unexpectedBehaviorsJson = require('../../resources/unexpectedBehaviors.json');

const testResultsResolver = testPlanRun => {
    const tests = testsResolver(testPlanRun.testPlanReport);

    // Populate nested test, scenario, assertion and unexpectedBehavior fields
    return testPlanRun.testResults.map(testResult => {
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
                ),
                unexpectedBehaviors: scenarioResult.unexpectedBehaviors.map(
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

module.exports = testResultsResolver;
