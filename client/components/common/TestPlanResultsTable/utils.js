// For each command, high and moderate negative behaviors is tracked, so 2
const NUMBER_NEGATIVE_IMPACTS = 2;

const getImpactFailedAssertionCount = (scenarioResults, impact) => {
    return scenarioResults.reduce(
        (acc, scenarioResult) =>
            acc +
            (scenarioResult.unexpectedBehaviors.some(e => e.impact === impact)
                ? 1
                : 0),
        0
    );
};

export const calculateAssertionsCount = testResult => {
    let passedAssertionsCount = testResult.scenarioResults.reduce(
        (acc, scenarioResult) =>
            acc + scenarioResult.assertionResults.filter(e => e.passed).length,
        0
    );

    let failedAssertionsCount = testResult.scenarioResults.reduce(
        (acc, scenarioResult) =>
            acc + scenarioResult.assertionResults.filter(e => !e.passed).length,
        0
    );

    const maxUnexpectedBehaviorsPassCount =
        testResult.scenarioResults.length * NUMBER_NEGATIVE_IMPACTS;

    // Any high impact negative behavior is a failure
    const highImpactFailedAssertionCount = getImpactFailedAssertionCount(
        testResult.scenarioResults,
        'HIGH'
    );

    // Any moderate impact negative behavior is a failure
    const moderateImpactFailedAssertionCount = getImpactFailedAssertionCount(
        testResult.scenarioResults,
        'MODERATE'
    );

    const weightedImpactFailedAssertionsCount =
        highImpactFailedAssertionCount + moderateImpactFailedAssertionCount;

    const weightedImpactPassedAssertionsCount =
        maxUnexpectedBehaviorsPassCount - weightedImpactFailedAssertionsCount;

    passedAssertionsCount += weightedImpactPassedAssertionsCount;
    failedAssertionsCount += weightedImpactFailedAssertionsCount;

    return { passedAssertionsCount, failedAssertionsCount };
};
