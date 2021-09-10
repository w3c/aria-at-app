const { At } = require('../../models');
const { remapTest } = require('../../scripts/import-tests/remapTest');

const testsResolver = async testPlanVersion => {
    // TODO: run this remapping before saving to database
    const allAts = await At.findAll();
    const tests = testPlanVersion.tests.map(test =>
        remapTest(test, { testPlanVersionId: testPlanVersion.id, allAts })
    );

    // TODO: fix before PR!
    const commands = Object.entries(
        await import('../../../client/resources/keys.mjs')
    ).map(([id, text]) => ({ id, text }));

    // Populate nested At and Command fields
    return tests.map(test => ({
        ...test,
        ats: test.atIds.map(atId => allAts.find(at => at.id === atId)),
        scenarios: test.scenarios.map(scenario => ({
            ...scenario,
            at: allAts.find(at => at.id === scenario.atId),
            command: commands.find(command => command.id === scenario.commandId)
        }))
    }));
};

module.exports = testsResolver;
