export const calculateAssertionsCount = (
    testResult,
    includeImpactCalculation = true
) => {
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

    if (includeImpactCalculation) {
        // For each command, a check for high negative and moderate negative impacts
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
        passedAssertionsCount =
            passedAssertionsCount + additionalPassedAssertions;
        failedAssertionsCount = failedAssertionsCount + unexpectedBehaviorCount;
    }

    return { passedAssertionsCount, failedAssertionsCount };
};
