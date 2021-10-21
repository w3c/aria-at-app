const conflictsResolver = require('./conflictsResolver');

const conflictsFormattedResolver = async (
    testPlanReport,
    { markdown = false },
    { user }
) => {
    const conflicts = await conflictsResolver(testPlanReport);

    if (!conflicts) return null;

    const mdheader = markdown ? '##### ' : '';
    const mdlist = markdown ? '* ' : '';

    let conflictsText = '';

    for (let i = 0; i < conflicts.length; i += 1) {
        const { source, conflictingResults } = conflicts[i];

        const yourScenarioResult = conflictingResults.find(
            ({ testPlanRun }) => testPlanRun.tester.id == user?.id
        )?.scenarioResult;

        const otherScenarioResults = conflictingResults
            .filter(({ testPlanRun }) => testPlanRun.tester.id != user?.id)
            .map(testResult => testResult.scenarioResult);

        if (source.assertion) {
            const assertion = source.assertion;
            const scenario = conflictingResults[0].scenario;

            const yourAssertionDifferenceFormatted = yourScenarioResult
                ? formatAssertionDifference(yourScenarioResult)
                : 'N/A';

            const otherAssertionDifferencesFormatted = otherScenarioResults.map(
                scenarioResult => formatAssertionDifference(scenarioResult)
            );

            conflictsText +=
                `${mdheader}Difference ${i + 1} - ` +
                `Testing ${scenario.command.text} for ${assertion.text}\n` +
                `${mdlist}Your result: ${yourAssertionDifferenceFormatted}\n`;

            otherAssertionDifferencesFormatted.forEach(other => {
                conflictsText += `${mdlist}Other result: ${other}\n`;
            });
        } else {
            const scenario = source.scenario;

            const yourDifferenceFormatted = yourScenarioResult
                ? formatUnexpectedBehaviorDifference(yourScenarioResult)
                : 'N/A';

            const otherDifferencesFormatted = otherScenarioResults.map(
                scenarioResult =>
                    formatUnexpectedBehaviorDifference(scenarioResult)
            );

            conflictsText +=
                `${mdheader}Difference ${i + 1} - ` +
                `Unexpected behavior when testing ${scenario.command.text}\n` +
                `${mdlist}Your unexpected behaviors: ` +
                `${yourDifferenceFormatted}\n`;

            otherDifferencesFormatted.forEach(otherDifferenceFormatted => {
                conflictsText +=
                    `${mdlist}Other unexpected behaviors: ` +
                    `${otherDifferenceFormatted}\n`;
            });
        }
    }

    return conflictsText;
};

const formatAssertionDifference = scenarioResult => {
    const failedReason = scenarioResult.assertionResults.find(
        assertionResult => assertionResult.passed !== true
    )?.failedReason;

    let formattedPassFail;
    switch (failedReason) {
        case 'INCORRECT_OUTPUT':
            formattedPassFail = 'FAILED: Incorrect Output';
            break;
        case 'NO_OUTPUT':
            formattedPassFail = 'FAILED: No Output';
            break;
        default:
            formattedPassFail = 'PASSED: Good Output';
    }

    return `${formattedPassFail} (for output "${scenarioResult.output}")`;
};

const formatUnexpectedBehaviorDifference = scenarioResult => {
    let formattedUnexpectedBehaviors;
    if (scenarioResult.unexpectedBehaviors.length === 0) {
        formattedUnexpectedBehaviors = 'No unexpected behaviors';
    } else {
        formattedUnexpectedBehaviors = scenarioResult.unexpectedBehaviors
            .map(
                unexpectedBehavior =>
                    unexpectedBehavior.otherUnexpectedBehaviorText ||
                    unexpectedBehavior.text
            )
            .join(', ');
    }

    const outputFormatted = `(for output "${scenarioResult.output}")`;
    return `${formattedUnexpectedBehaviors} ${outputFormatted}`;
};

module.exports = conflictsFormattedResolver;
