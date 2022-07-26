const testsResolver = require('../TestPlanVersion/testsResolver');
const unexpectedBehaviorsJson = require('../../resources/unexpectedBehaviors.json');

const testResultsResolver = testPlanRun => {
    const { testPlanReport } = testPlanRun;
    const tests = testsResolver(testPlanReport);

    // Populate nested test, atVersion, browserVersion, scenario, assertion and
    // unexpectedBehavior fields
    return testPlanRun.testResults.map(testResult => {
        const test = tests.find(each => each.id === testResult.testId);
        return {
            ...testResult,
            test,
            atVersion: testPlanReport.at.atVersions.find(
                each => each.id == testResult.atVersionId
            ),
            browserVersion: testPlanReport.browser.browserVersions.find(
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
                    unexpectedBehaviorId => ({
                        id: unexpectedBehaviorId,
                        text: unexpectedBehaviorsJson.find(
                            each => each.id === unexpectedBehaviorId
                        ).text
                    })
                )
            }))
        };
    });
};

module.exports = testResultsResolver;
