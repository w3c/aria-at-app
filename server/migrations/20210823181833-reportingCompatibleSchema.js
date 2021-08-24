const { TestPlanVersion, At } = require('../models');
const locationOfDataId = require('../util/locationOfDataId');

const remapTest = (previous, context) => {
    const { testPlanVersionId, allAts } = context;

    const testId = locationOfDataId.encode(
        { testPlanVersionId },
        { executionOrder: previous.executionOrder }
    );

    const getAtFromAtSlug = atSlug => {
        console.log('atSlug', atSlug);
        switch (atSlug) {
            case 'jaws':
                return allAts.find(at => at.name === 'JAWS').id;
            case 'nvda':
                return allAts.find(at => at.name === 'NVDA').id;
            case 'voiceover_macos':
                return allAts.find(at => at.name === 'VoiceOver for MacOS').id;
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
            const [commandInstruction, raw2] = raw1;

            if (commandInstruction !== previous.testJson.task) {
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

                    const commands = raw4.map(raw => raw[0]);

                    for (const command of commands) {
                        scenarios.push({
                            id: locationOfDataId.encode(
                                { testId },
                                { scenarioIndex }
                            ),
                            atId: at.id,
                            command
                        });
                        scenarioIndex += 1;
                    }
                }
            }
        }

        return scenarios;
    };

    const remapAssertion = previousAssertion => {
        return {
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
            manualAssertion: previousAssertion[1]
        };
    };

    return {
        id: testId,
        title: previous.testFullName,
        atIds: previous.testJson.applies_to
            .map(getAtFromAtSlug)
            .map(at => at.id),
        atMode: remapMode(previous.testJson.mode),
        preCommandInstructions: previous.testJson.specific_user_instruction.split(
            ' | '
        ),
        commandInstruction: previous.testJson.task,
        scenarios: getScenarios(),
        assertions: previous.testJson.output_assertions.map(remapAssertion),
        // Without Math.random() it would be too easy to use this data, making
        // the label "unused" meaningless
        [`unused_${Math.random()}`]: {
            scripts: previous.scripts,
            htmlFile: previous.htmlFile,
            setupTestPage: previous.testJson.setupTestPage,
            setupScriptDescription: previous.testJson.setup_script_description,
            commitHash: previous.commitHash,
            executionOrder: previous.executionOrder
        }
    };
};

const reverseRemapTest = (current, context) => {
    const { allAts } = context;

    const unused = Object.entries(current).find(([key]) => {
        return key.startsWith('unused_');
    })[1];

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
            case 'VoiceOver for MacOS':
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
        return [priority, currentAssertion.manualAssertion];
    };

    const getCommandJson = () => {
        const atCommands = {};

        current.scenarios.forEach(scenario => {
            const atSlug = reverseRemapAtId(scenario.atId);
            if (!atCommands[atSlug]) atCommands[atSlug] = [];
            atCommands[atSlug].push([scenario.command]);
        });

        return {
            [current.commandInstruction]: {
                [reverseRemapMode(current.atMode)]: atCommands
            }
        };
    };

    return {
        testJson: {
            mode: reverseRemapMode(current.atMode),
            task: current.commandInstruction,
            applies_to: current.atIds.map(reverseRemapAtId),
            setupTestPage: unused.setupTestPage,
            output_assertions: current.assertions.map(reverseRemapAssertion),
            setup_script_description: unused.setupScriptDescription,
            specific_user_instruction: current.preCommandInstructions.join(
                ' | '
            )
        },
        scripts: unused.scripts,
        htmlFile: unused.htmlFile,
        commitHash: unused.commitHash,
        commandJson: getCommandJson(),
        testFullName: current.title,
        executionOrder: unused.executionOrder
    };
};

module.exports = {
    up: async (/* queryInterface, Sequelize */) => {
        const testPlanVersion = await TestPlanVersion.findOne();
        const ats = await At.findAll();
        const context = { testPlanVersionId: testPlanVersion.id, allAts: ats };
        console.log(testPlanVersion.tests[0]);
        const remapped = remapTest(testPlanVersion.tests[0], context);
        console.log(remapped);
        console.log(reverseRemapTest(remapped, context));
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
