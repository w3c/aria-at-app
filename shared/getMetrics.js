const convertAssertionPriority = require('./convertAssertionPriority');

const sum = arr => arr?.reduce((total, item) => total + item, 0) || 0;

const countTests = ({
    testPlanReport, // Choose one to provide
    testResult, // Choose one to provide
    scenarioResult, // Choose one to provide
    passedOnly
}) => {
    const countScenarioResult = scenarioResult => {
        return (
            scenarioResult?.assertionResults?.every(
                assertionResult => assertionResult.passed
            ) || 0
        );
    };

    const countTestResult = testResult => {
        if (passedOnly)
            return testResult?.scenarioResults?.every(countScenarioResult)
                ? 1
                : 0;
        return testResult ? 1 : 0;
    };
    const countTestPlanReport = testPlanReport => {
        return sum(
            testPlanReport?.finalizedTestResults?.map(countTestResult) || []
        );
    };

    if (testPlanReport) return countTestPlanReport(testPlanReport);
    if (testResult) return countTestResult(testResult);
    return countScenarioResult(scenarioResult);
};

const countAssertions = ({
    testPlanReport, // Choose one to provide
    testResult, // Choose one to provide
    scenarioResult, // Choose one to provide
    priority,
    passedOnly
}) => {
    const countScenarioResult = scenarioResult => {
        const isClient =
            `${priority.toLowerCase()}AssertionResults` in scenarioResult;
        let all;
        if (isClient) {
            all =
                scenarioResult?.[`${priority.toLowerCase()}AssertionResults`] ||
                [];
        } else {
            all = scenarioResult.assertionResults.filter(
                a =>
                    convertAssertionPriority(a.assertion.priority) ===
                    convertAssertionPriority(priority)
            );
        }
        if (passedOnly) return all.filter(each => each.passed).length;
        return all.length;
    };
    const countTestResult = testResult => {
        return sum(testResult?.scenarioResults?.map(countScenarioResult) || []);
    };
    const countTestPlanReport = testPlanReport => {
        return sum(
            testPlanReport?.finalizedTestResults?.map(countTestResult) || []
        );
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
        return scenarioResult?.unexpectedBehaviors?.length || 0;
    };
    const countTestResult = testResult => {
        return sum(testResult?.scenarioResults?.map(countScenarioResult) || []);
    };
    const countTestPlanReport = testPlanReport => {
        return sum(
            testPlanReport?.finalizedTestResults?.map(countTestResult) || []
        );
    };

    if (testPlanReport) return countTestPlanReport(testPlanReport);
    if (testResult) return countTestResult(testResult);
    return countScenarioResult(scenarioResult);
};

const countUnexpectedBehaviorsImpact = (
    {
        scenarioResult, // Choose one to provide
        testResult, // Choose one to provide
        testPlanReport // Choose one to provide
    },
    impact
) => {
    const countScenarioResult = scenarioResult => {
        return scenarioResult?.unexpectedBehaviors?.some(
            e => e.impact === impact
        )
            ? 1
            : 0;
    };
    const countTestResult = testResult => {
        return sum(testResult?.scenarioResults?.map(countScenarioResult) || []);
    };
    const countTestPlanReport = testPlanReport => {
        return sum(
            testPlanReport?.finalizedTestResults?.map(countTestResult) || []
        );
    };

    if (testPlanReport) return countTestPlanReport(testPlanReport);
    if (testResult) return countTestResult(testResult);
    return countScenarioResult(scenarioResult);
};

const countCommands = ({
    scenarioResult, // Choose one to provide
    testResult, // Choose one to provide
    testPlanReport // Choose one to provide
}) => {
    const countScenarioResult = scenarioResult => {
        return scenarioResult?.scenario?.commands?.length || 0;
    };
    const countTestResult = testResult => {
        return sum(testResult?.scenarioResults?.map(countScenarioResult) || []);
    };
    const countTestPlanReport = testPlanReport => {
        return sum(
            testPlanReport?.finalizedTestResults?.map(countTestResult) || []
        );
    };

    if (testPlanReport) return countTestPlanReport(testPlanReport);
    if (testResult) return countTestResult(testResult);
    return countScenarioResult(scenarioResult);
};

const calculateAssertionPriorityCounts = (result, priority) => {
    const assertionsPassedCount = countAssertions({
        ...result,
        priority,
        passedOnly: true
    });
    const assertionsCount = countAssertions({
        ...result,
        priority
    });
    const assertionsFailedCount = assertionsCount - assertionsPassedCount;

    return { assertionsCount, assertionsPassedCount, assertionsFailedCount };
};

const getMetrics = ({
    scenarioResult, // Choose one to provide
    testResult, // Choose one to provide
    testPlanReport // Choose one to provide
}) => {
    const result = { scenarioResult, testResult, testPlanReport };

    // Each command has 2 additional assertions:
    // * Other behaviors that create severe negative impact
    // * Other behaviors that create moderate negative impact
    const commandsCount = countCommands({ ...result });

    const severeImpactFailedAssertionCount = countUnexpectedBehaviorsImpact(
        { ...result },
        'SEVERE'
    );
    const moderateImpactFailedAssertionCount = countUnexpectedBehaviorsImpact(
        { ...result },
        'MODERATE'
    );

    const severeImpactPassedAssertionCount =
        commandsCount - severeImpactFailedAssertionCount;
    const moderateImpactPassedAssertionCount =
        commandsCount - moderateImpactFailedAssertionCount;

    let {
        assertionsCount: requiredAssertionsCount,
        assertionsPassedCount: requiredAssertionsPassedCount,
        assertionsFailedCount: requiredAssertionsFailedCount
    } = calculateAssertionPriorityCounts(result, 'REQUIRED');
    requiredAssertionsCount += commandsCount;
    requiredAssertionsPassedCount += severeImpactPassedAssertionCount;
    requiredAssertionsFailedCount += severeImpactFailedAssertionCount;

    let {
        assertionsCount: optionalAssertionsCount,
        assertionsPassedCount: optionalAssertionsPassedCount,
        assertionsFailedCount: optionalAssertionsFailedCount
    } = calculateAssertionPriorityCounts(result, 'OPTIONAL');
    optionalAssertionsCount += commandsCount;
    optionalAssertionsPassedCount += moderateImpactPassedAssertionCount;
    optionalAssertionsFailedCount += moderateImpactFailedAssertionCount;

    const {
        assertionsCount: mayAssertionsCount,
        assertionsPassedCount: mayAssertionsPassedCount,
        assertionsFailedCount: mayAssertionsFailedCount
    } = calculateAssertionPriorityCounts(result, 'MAY');

    const testsPassedCount = countTests({
        ...result,
        passedOnly: true
    });
    const testsCount =
        testPlanReport?.runnableTests?.length || countTests({ ...result });
    const testsFailedCount = testsCount - testsPassedCount;

    const requiredFormatted = `${requiredAssertionsPassedCount} of ${requiredAssertionsCount} passed`;
    const optionalFormatted =
        optionalAssertionsCount === 0
            ? false
            : `${optionalAssertionsPassedCount} of ${optionalAssertionsCount} passed`;
    const mayFormatted =
        mayAssertionsCount === 0
            ? false
            : `${mayAssertionsPassedCount} of ${mayAssertionsCount} passed`;

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
        mayAssertionsPassedCount,
        mayAssertionsCount,
        mayAssertionsFailedCount,
        testsPassedCount,
        testsCount,
        testsFailedCount,
        unexpectedBehaviorCount,
        severeImpactPassedAssertionCount,
        severeImpactFailedAssertionCount,
        moderateImpactPassedAssertionCount,
        moderateImpactFailedAssertionCount,
        commandsCount,
        requiredFormatted,
        optionalFormatted,
        mayFormatted,
        unexpectedBehaviorsFormatted,
        supportLevel,
        supportPercent
    };
};

module.exports = getMetrics;
