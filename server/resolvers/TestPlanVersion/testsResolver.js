const ats = require('../../resources/ats.json');
const commands = require('../../resources/commands.json');
const { getTestPlanVersionById } = require("../../models/services/TestPlanVersionService");
// const { getTestById } = require('../../models/services/TestService');

/**
 * Resolves the Tests from their reduced form in the database to a fully-
 * populated form. Must be called before returning any test in GraphQL.
 * @param {*} parentRecord - Can be a TestPlanVersion or a TestPlanReport. Using
 * a TestPlanReport is preferable because it allows the resolver to infer a
 * default atId for child fields as in the `renderableContent(atId: ID)` field.
 * @returns {array[*]} - An array of resolved tests.
 */
const testsResolver = /*async*/ parentRecord => {
    const isTestPlanVersion = !!parentRecord.tests;
    const testPlanReport = isTestPlanVersion ? null : parentRecord;
    const testPlanVersion = isTestPlanVersion
        ? parentRecord
        : testPlanReport.testPlanVersion;
    const inferredAtId = testPlanReport?.atId;

    // if (!testPlanVersion.tests) {
    //     const result = await getTestPlanVersionById(testPlanVersion.id);
    //     // console.log(result)
    //     testPlanVersion.tests = result.dataValues.tests;
    // }

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

    /*return testPlanVersion.tests.map(async testId => {
        const result = await getTestById(testId);
        const test = result.dataValues.test;
        return {
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
        };
    });*/
};

module.exports = testsResolver;
