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

    // For each command, a check for high negative and moderate negative impacts, so 2
    const maxUnexpectedBehaviorsPassCount =
        testResult.scenarioResults.length * 2;

    // These are equivalent to failures
    const unexpectedBehaviorCount = testResult.scenarioResults.reduce(
        (acc, scenarioResult) =>
            acc +
            (scenarioResult.unexpectedBehaviors.some(
                e => e.severity === 'HIGH' || e.severity === 'MODERATE'
            )
                ? 1
                : 0),
        0
    );

    const additionalPassedAssertions =
        maxUnexpectedBehaviorsPassCount - unexpectedBehaviorCount;
    passedAssertionsCount = passedAssertionsCount + additionalPassedAssertions;
    failedAssertionsCount = failedAssertionsCount + unexpectedBehaviorCount;

    return { passedAssertionsCount, failedAssertionsCount };
};
