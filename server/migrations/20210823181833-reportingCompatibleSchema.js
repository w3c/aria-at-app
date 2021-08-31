const { TestPlanVersion, At } = require('../models');
const { getTestPlanRunById } = require('../models/services/TestPlanRunService');
const { getTestId } = require('../../server/scripts/import-tests/remapTest');
const { locationOfDataId } = require('../services/PopulatedData');

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
            customUnexpectedBehaviorText: unexpectedBehavior.more?.value
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

module.exports = {
    up: async (/* queryInterface, Sequelize */) => {
        const commands = Object.entries(
            await import('../../client/resources/keys.mjs')
        ).map(([id, text]) => ({ id, text }));

        const testPlanVersion = await TestPlanVersion.findOne({
            where: { id: 11 }
        });
        const ats = await At.findAll();
        const testContext = {
            testPlanVersionId: testPlanVersion.id,
            allAts: ats
        };
        // console.log(
        //     JSON.stringify(
        //         testPlanVersion.tests.map(test => [
        //             remapTest(test, testContext),
        //             reverseRemapTest(remapTest(test, testContext), testContext)
        //         ]),
        //         null,
        //         2
        //     )
        // );

        const testPlanRun = await getTestPlanRunById(1);

        const testResultContext = {
            testPlanVersionId: testPlanRun.testPlanReport.testPlanVersion.id,
            testPlanRunId: testPlanRun.id,
            tests: testPlanRun.testPlanReport.testPlanVersion.tests.map(test =>
                remapTest(test, testContext)
            ),
            allAts: ats,
            unexpectedBehaviors,
            commands
        };
        log(remapTestResults(testPlanRun.testResults, testResultContext));
    },

    down: async (/* queryInterface, Sequelize */) => {
        /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    }
};
