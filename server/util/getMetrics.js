const sum = arr => arr.reduce((total, item) => total + item, 0);

const countTests = ({
    testPlanReport, // Choose one to provide
    testResult, // Choose one to provide
    scenarioResult, // Choose one to provide
    passedOnly
}) => {
    const countScenarioResult = scenarioResult => {
        return scenarioResult.assertionResults.every(
            assertionResult => assertionResult.passed
        );
    };

    const countTestResult = testResult => {
        if (passedOnly)
            return testResult.scenarioResults.every(countScenarioResult)
                ? 1
                : 0;
        return testResult ? 1 : 0;
    };
    const countTestPlanReport = testPlanReport => {
        return sum(testPlanReport.finalizedTestResults.map(countTestResult));
    };

    if (testPlanReport) return countTestPlanReport(testPlanReport);
    if (testResult) return countTestResult(testResult);
    return countScenarioResult(scenarioResult, testResult);
};

const countAssertions = ({
    testPlanReport, // Choose one to provide
    testResult, // Choose one to provide
    scenarioResult, // Choose one to provide
    priority,
    passedOnly
}) => {
    const countScenarioResult = scenarioResult => {
        const all = scenarioResult.assertionResults.filter(
            a => a.assertion.priority === priority
        );
        if (passedOnly) return all.filter(each => each.passed).length;
        return all.length;
    };
    const countTestResult = testResult => {
        return sum(testResult.scenarioResults.map(countScenarioResult));
    };
    const countTestPlanReport = testPlanReport => {
        return sum(testPlanReport.finalizedTestResults.map(countTestResult));
    };

    if (testPlanReport) return countTestPlanReport(testPlanReport);
    if (testResult) return countTestResult(testResult);
    return countScenarioResult(scenarioResult);
};

const countUnexpectedBehaviors = ({
    scenarioResult, // Choose one to provide
    testResult, // Choose one to provide
    testPlanReport // Choose one to provide
}) => {
    const countScenarioResult = scenarioResult => {
        return scenarioResult.unexpectedBehaviors.length;
    };
    const countTestResult = testResult => {
        return sum(testResult.scenarioResults.map(countScenarioResult));
    };
    const countTestPlanReport = testPlanReport => {
        return sum(testPlanReport.finalizedTestResults.map(countTestResult));
    };

    if (testPlanReport) return countTestPlanReport(testPlanReport);
    if (testResult) return countTestResult(testResult);
    return countScenarioResult(scenarioResult);
};

const getMetrics = ({
    scenarioResult, // Choose one to provide
    testResult, // Choose one to provide
    testPlanReport // Choose one to provide
}) => {
    const result = { scenarioResult, testResult, testPlanReport };
    const requiredAssertionsPassedCount = countAssertions({
        ...result,
        priority: 'REQUIRED',
        passedOnly: true
    });
    const requiredAssertionsCount = countAssertions({
        ...result,
        priority: 'REQUIRED'
    });
    const requiredAssertionsFailedCount =
        requiredAssertionsCount - requiredAssertionsPassedCount;

    const optionalAssertionsPassedCount = countAssertions({
        ...result,
        priority: 'OPTIONAL',
        passedOnly: true
    });
    const optionalAssertionsCount = countAssertions({
        ...result,
        priority: 'OPTIONAL'
    });
    const optionalAssertionsFailedCount =
        optionalAssertionsCount - optionalAssertionsPassedCount;

    const testsPassedCount = countTests({
        ...result,
        passedOnly: true
    });
    const testsCount =
        testPlanReport?.runnableTests.length || countTests({ ...result });
    const testsFailedCount = testsCount - testsPassedCount;

    const requiredFormatted = `${requiredAssertionsPassedCount} of ${requiredAssertionsCount} passed`;
    const optionalFormatted =
        optionalAssertionsCount === 0
            ? false
            : `${optionalAssertionsPassedCount} of ${optionalAssertionsCount} passed`;

    const unexpectedBehaviorCount = countUnexpectedBehaviors({ ...result });
    const unexpectedBehaviorsFormatted =
        unexpectedBehaviorCount === 0
            ? false
            : `${unexpectedBehaviorCount} found`;

    let supportLevel;
    if (unexpectedBehaviorCount > 0 || requiredAssertionsFailedCount > 0) {
        supportLevel = 'FAILING';
    } else if (optionalAssertionsFailedCount > 0) {
        supportLevel = 'ALL_REQUIRED';
    } else {
        supportLevel = 'FULL';
    }

    const supportPercent = Math.round(
        (requiredAssertionsPassedCount / requiredAssertionsCount) * 100
    );

    return {
        requiredAssertionsPassedCount,
        requiredAssertionsCount,
        requiredAssertionsFailedCount,
        optionalAssertionsPassedCount,
        optionalAssertionsCount,
        optionalAssertionsFailedCount,
        testsPassedCount,
        testsCount,
        testsFailedCount,
        unexpectedBehaviorCount,
        requiredFormatted,
        optionalFormatted,
        unexpectedBehaviorsFormatted,
        supportLevel,
        supportPercent
    };
};

module.exports = getMetrics;
