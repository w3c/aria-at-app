const { omit } = require('lodash');
const { TestPlanVersion } = require('../models');
const commandList = require('../resources/commandsV1.json');

module.exports = {
    up: async queryInterface => {
        const [[{ count: testPlanVersionCount }]] =
            await queryInterface.sequelize.query(
                `SELECT COUNT(*) FROM "TestPlanVersion"`
            );
        if (!Number(testPlanVersionCount)) return;

        const testPlanVersions = await TestPlanVersion.findAll({
            attributes: {
                exclude: [
                    'testPlanId',
                    'phase',
                    'candidatePhaseReachedAt',
                    'recommendedPhaseReachedAt',
                    'recommendedPhaseTargetDate'
                ]
            }
        });
        await Promise.all(
            testPlanVersions.map(testPlanVersion => {
                const newTests = testPlanVersion.tests.map(test => ({
                    ...test,
                    scenarios: test.scenarios.map(scenario => ({
                        ...omit(scenario, ['commandId']),
                        commandIds: (() => {
                            // This special case only applies to the sandbox
                            // due to a previous version of this migration.
                            if (scenario.commandIds) {
                                if (scenario.commandIds[0].includes(',')) {
                                    return scenario.commandIds[0].split(',');
                                }
                                return scenario.commandIds;
                            }
                            if (scenario.commandId.includes(',')) {
                                return scenario.commandId.split(',');
                            }
                            return [scenario.commandId];
                        })()
                    })),
                    renderableContent: Object.fromEntries(
                        Object.entries(test.renderableContent).map(
                            ([atId, content]) => [
                                atId,
                                {
                                    ...content,
                                    // prettier-ignore
                                    commands: content.commands.map(command => {
                                        const keypresses = (() => {
                                            if (command.id.includes(',')) {
                                                const ids = command.id
                                                    .split(',')
                                                    .map(id => id.replace(/"/g, '')); // remove quotes
                                                return ids.map(id => ({
                                                    id,
                                                    keystroke: commandList
                                                        .find(each => each.id === id)
                                                        ?.text || (() => {
                                                            throw new Error(
                                                                `Command '${id}' found which is not in commandsV1.json`
                                                            );
                                                        })()
                                                }));
                                            }
                                            const { id, keystroke } = command;
                                            return [{ id, keystroke }];
                                        })();

                                        return {
                                            ...command,
                                            keystroke: keypresses
                                                .map(({ keystroke }) => keystroke)
                                                .join(', then '),
                                            keypresses
                                        };
                                    })
                                }
                            ]
                        )
                    )
                }));
                testPlanVersion.tests = newTests;
                return testPlanVersion.save();
            })
        );
    }
};
