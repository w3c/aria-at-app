// This file is needed as long as the database is using an old version of the
// JSON schema. A good course of action would be to migrate the database and
// remove this file.

const { Base64 } = require('js-base64');
const { locationOfDataId } = require('../../services/PopulatedData');

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

module.exports = {
    remapTest,
    reverseRemapTest,
    getTestId
};
