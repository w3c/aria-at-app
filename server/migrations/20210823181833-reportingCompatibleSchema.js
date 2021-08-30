const { Base64 } = require('js-base64');
const { TestPlanVersion, At } = require('../models');
const { getTestPlanRunById } = require('../models/services/TestPlanRunService');
const locationOfDataId = require('../util/locationOfDataId');

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

const getTestId = ({ testPlanVersionId, executionOrder }) => {
    return locationOfDataId.encode({ testPlanVersionId }, { executionOrder });
};

const remapTest = (previous, context) => {
    const { testPlanVersionId, allAts } = context;

    const testId = getTestId({
        testPlanVersionId,
        executionOrder: previous.executionOrder
    });

    const getAtFromAtSlug = atSlug => {
        switch (atSlug) {
            case 'jaws':
                return allAts.find(at => at.name === 'JAWS');
            case 'nvda':
                return allAts.find(at => at.name === 'NVDA');
            case 'voiceover_macos':
                return allAts.find(at => at.name === 'VoiceOver for macOS');
            default:
                throw new Error();
        }
    };

    const remapMode = previousMode => {
        switch (previousMode) {
            case 'reading':
                return 'READING';
            case 'interaction':
                return 'INTERACTION';
            default:
                throw new Error();
        }
    };

    const getScenarios = () => {
        const scenarios = [];
        let scenarioIndex = 0;

        for (const raw1 of Object.entries(previous.commandJson)) {
            const [task, raw2] = raw1;

            if (task !== previous.testJson.task) {
                continue; // Not relevant to this test
            }

            for (const [rawMode, raw3] of Object.entries(raw2)) {
                if (rawMode !== previous.testJson.mode) {
                    continue; // Not relevant to this test
                }

                for (const [rawAtSlug, raw4] of Object.entries(raw3)) {
                    if (!previous.testJson.applies_to.includes(rawAtSlug)) {
                        continue; // Not relevant to this test
                    }

                    const at = getAtFromAtSlug(rawAtSlug);

                    const commandIds = raw4.map(raw => raw[0]);

                    for (const commandId of commandIds) {
                        scenarios.push({
                            id: locationOfDataId.encode(
                                { testId },
                                { scenarioIndex }
                            ),
                            atId: at.id,
                            commandId
                        });
                        scenarioIndex += 1;
                    }
                }
            }
        }

        return scenarios;
    };

    const remapAssertion = (previousAssertion, index) => {
        return {
            id: locationOfDataId.encode({ testId }, { assertionIndex: index }),
            priority: (() => {
                switch (previousAssertion[0]) {
                    case '1':
                        return 'REQUIRED';
                    case '2':
                        return 'OPTIONAL';
                    default:
                        throw new Error();
                }
            })(),
            text: previousAssertion[1]
        };
    };

    return {
        id: testId,
        title: previous.testFullName,
        atIds: previous.testJson.applies_to
            .map(getAtFromAtSlug)
            .map(at => at.id),
        atMode: remapMode(previous.testJson.mode),
        startupScriptContent: previous.scripts,
        instructions: previous.testJson.specific_user_instruction.split(' | '),
        scenarios: getScenarios(),
        assertions: previous.testJson.output_assertions.map(remapAssertion),
        testRendererRemappingData: Base64.encode(
            JSON.stringify({
                htmlFile: previous.htmlFile,
                task: previous.testJson.task,
                setupTestPage: previous.testJson.setupTestPage,
                setupScriptDescription:
                    previous.testJson.setup_script_description,
                commitHash: previous.commitHash,
                executionOrder: previous.executionOrder
            }),
            true
        )
    };
};

const reverseRemapTest = (current, context) => {
    const { allAts } = context;

    const unused = JSON.parse(Base64.decode(current.testRendererRemappingData));

    const reverseRemapMode = currentMode => {
        switch (currentMode) {
            case 'READING':
                return 'reading';
            case 'INTERACTION':
                return 'interaction';
            default:
                throw new Error();
        }
    };

    const reverseRemapAtId = atId => {
        const at = allAts.find(at => at.id === atId);
        switch (at.name) {
            case 'JAWS':
                return 'jaws';
            case 'NVDA':
                return 'nvda';
            case 'VoiceOver for macOS':
                return 'voiceover_macos';
            default:
                throw new Error();
        }
    };

    const reverseRemapAssertion = currentAssertion => {
        const priority = (() => {
            switch (currentAssertion.priority) {
                case 'REQUIRED':
                    return '1';
                case 'OPTIONAL':
                    return '2';
            }
        })();
        return [priority, currentAssertion.text];
    };

    const getCommandJson = () => {
        const atCommands = {};

        current.scenarios.forEach(scenario => {
            const atSlug = reverseRemapAtId(scenario.atId);
            if (!atCommands[atSlug]) atCommands[atSlug] = [];
            atCommands[atSlug].push([scenario.command.id]);
        });

        return {
            [unused.task]: {
                [reverseRemapMode(current.atMode)]: atCommands
            }
        };
    };

    return {
        testJson: {
            mode: reverseRemapMode(current.atMode),
            task: unused.task,
            applies_to: current.atIds.map(reverseRemapAtId),
            setupTestPage: unused.setupTestPage,
            output_assertions: current.assertions.map(reverseRemapAssertion),
            setup_script_description: unused.setupScriptDescription,
            specific_user_instruction: current.instructions.join(' | ')
        },
        scripts: current.startupScriptContent,
        htmlFile: unused.htmlFile,
        commitHash: unused.commitHash,
        commandJson: getCommandJson(),
        testFullName: current.title,
        executionOrder: unused.executionOrder
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
