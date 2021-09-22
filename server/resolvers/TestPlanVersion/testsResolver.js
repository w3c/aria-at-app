const ats = require('../../resources/ats.json');
const commands = require('../../resources/commands.json');

const testsResolver = testPlanVersion => {
    // Populate nested At and Command fields
    return testPlanVersion.tests.map(test => ({
        ...test,
        ats: test.atIds.map(atId => ats.find(at => at.id === atId)),
        scenarios: test.scenarios.map(scenario => ({
            ...scenario,
            at: ats.find(at => at.id === scenario.atId),
            command: commands.find(command => command.id === scenario.commandId)
        }))
    }));
};

module.exports = testsResolver;
