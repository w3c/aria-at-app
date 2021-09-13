// This file is needed as long as the database is using an old version of the
// JSON schema. A good course of action would be to migrate the database and
// remove this file.

const { getTestId } = require('./remapTest');
const locationOfDataId = require('../../services/PopulatedData/locationOfDataId');

const unexpectedBehaviors = [
    {
        id: 'excessively_verbose',
        text:
            'Output is excessively verbose, e.g., includes redundant and/or ' +
            'irrelevant speech'
    },
    {
        id: 'unexpected_cursor_position',
        text: 'Reading cursor position changed in an unexpected manner'
    },
    { id: 'sluggish', text: 'Screen reader became extremely sluggish' },
    { id: 'at_crashed', text: 'Screen reader crashed' },
    { id: 'browser_crashed', text: 'Browser crashed' },
    { id: 'other', text: 'Other' }
];

const getRemapTestResultContext = async ({
    testPlanVersion,
    testPlanRun,
    tests,
    allAts
}) => {
    // TODO: fix before PR
    const commands = Object.entries(
        require('../../../client/resources/keys.json')
    ).map(([id, text]) => ({ id, text }));

    return {
        testPlanVersionId: testPlanVersion.id,
        testPlanRunId: testPlanRun.id,
        tests,
        allAts,
        unexpectedBehaviors,
        commands
    };
};

const remapTestResults = (previous, context) => {
    const results = [];
    previous.forEach(previousTestResult => {
        if (!previousTestResult.result) return;
        results.push(remapTestResult(previousTestResult, context));
    });
    return results;
};

const remapTestResult = (previous, context) => {
    const {
        testPlanVersionId,
        testPlanRunId,
        tests,
        allAts,
        unexpectedBehaviors,
        commands
    } = context;

    const testId = getTestId({
        testPlanVersionId,
        executionOrder: previous.test.executionOrder
    });

    const test = tests.find(test => test.id === testId);

    const testResultId = locationOfDataId.encode(
        { testPlanRunId },
        { executionOrder: previous.test.executionOrder }
    );

    const at = allAts.find(at => at.name === previous.state.config.at.name);

    const remapAssertionResult = (previousAssertion, { scenarioResultId }) => {
        const assertion = test.assertions.find(
            each => each.text === previousAssertion.description
        );
        return {
            id: locationOfDataId.encode(
                { scenarioResultId },
                { atId: at.id, assertionId: assertion.id }
            ),
            assertionId: assertion.id,
            passed: previousAssertion.result === 'pass',
            failedReason: (() => {
                switch (previousAssertion.result) {
                    case 'pass':
                        return null;
                    case 'failIncorrect':
                        return 'INCORRECT_OUTPUT';
                    case 'failMissing':
                        return 'NO_OUTPUT';
                    default:
                        throw new Error();
                }
            })()
        };
    };

    const remapUnexpectedBehavior = previousUnexpectedBehavior => {
        const unexpectedBehavior = unexpectedBehaviors.find(each => {
            return each.text === previousUnexpectedBehavior.description;
        });
        return {
            id: unexpectedBehavior.id,
            text: unexpectedBehavior.text,
            otherUnexpectedBehaviorText: previousUnexpectedBehavior.more?.value
        };
    };

    const remapScenarioResult = previousScenario => {
        const command = commands.find(
            each => each.text === previousScenario.description
        );
        const scenarioId = test.scenarios.find(
            each => each.commandId === command.id && each.atId === at.id
        ).id;
        const scenarioResultId = locationOfDataId.encode(
            { testResultId },
            { scenarioId }
        );
        return {
            id: scenarioResultId,
            scenarioId,
            output: previousScenario.atOutput.value,
            assertionResults: previousScenario.assertions.map(
                previousAssertion =>
                    remapAssertionResult(previousAssertion, {
                        scenarioResultId
                    })
            ),
            unexpectedBehaviors: previousScenario.unexpected.behaviors.reduce(
                (array, previousUnexpected) => {
                    if (previousUnexpected.checked) {
                        return array.concat(
                            remapUnexpectedBehavior(previousUnexpected)
                        );
                    }
                    return array;
                },
                []
            )
        };
    };

    return {
        id: testResultId,
        testId,
        startedAt: null, // TODO: Populate on client
        completedAt: null, // TODO: Populate on client
        scenarioResults: previous.state.commands.map(remapScenarioResult)
    };
};

module.exports = { getRemapTestResultContext, remapTestResults };
