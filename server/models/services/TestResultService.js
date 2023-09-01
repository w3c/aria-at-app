const unexpectedBehaviorsJson = require('../../resources/unexpectedBehaviors.json');
const getTests = require('./TestsService');
const AtLoader = require('../loaders/AtLoader');
const BrowserLoader = require('../loaders/BrowserLoader');

/**
 *
 */
const getTestResults = async testPlanRun => {
    const { testPlanReport } = testPlanRun;
    const tests = getTests(testPlanReport);
    const atLoader = AtLoader();
    const browserLoader = BrowserLoader(); // Might be a deoptimization, possible optional pass from context
    const ats = await atLoader.getAll();
    const browsers = await browserLoader.getAll();

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

const findOrCreateTestResult = async () => {
    //STUB
};

module.exports = {
    getTestResults,
    findOrCreateTestResult
};
