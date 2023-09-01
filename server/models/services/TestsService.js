const ats = require('../../resources/ats.json');
const commands = require('../../resources/commands.json');

const getTests = parentRecord => {
    const isTestPlanVersion = !!parentRecord.tests;
    const testPlanReport = isTestPlanVersion ? null : parentRecord;
    const testPlanVersion = isTestPlanVersion
        ? parentRecord
        : testPlanReport.testPlanVersion;
    const inferredAtId = testPlanReport?.atId;

    // Populate nested At and Command fields
    return testPlanVersion.tests.map(test => ({
        ...test,
        inferredAtId, // Not available in GraphQL, but used by child resolvers
        ats: test.atIds.map(atId => ats.find(at => at.id === atId)),
        scenarios: test.scenarios.map(scenario => ({
            ...scenario,
            at: ats.find(at => at.id === scenario.atId),
            commands: scenario.commandIds.map(commandId => {
                return commands.find(command => command.id === commandId);
            })
        }))
    }));
};

module.exports = getTests;
