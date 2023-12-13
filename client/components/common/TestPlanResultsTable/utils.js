export const calculateAssertionsCount = testResult => {
    const passedAssertionsCount = testResult.scenarioResults.reduce(
        (acc, scenarioResult) =>
            acc + scenarioResult.assertionResults.filter(e => e.passed).length,
        0
    );

    const failedAssertionsCount = testResult.scenarioResults.reduce(
        (acc, scenarioResult) =>
            acc + scenarioResult.assertionResults.filter(e => !e.passed).length,
        0
    );

    return { passedAssertionsCount, failedAssertionsCount };
};
