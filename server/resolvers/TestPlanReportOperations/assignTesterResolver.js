const { AuthenticationError } = require('apollo-server');
const {
    createTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populatedDataResolver = require('../PopulatedData');

const assignTesterResolver = async (
    { parentContext: { id: testPlanReportId } },
    { userId: testerUserId },
    { user }
) => {
    // TODO: FIXME; seems to be expecting a string array; actually an array of objects instead
    // if (!user.roles.includes('ADMIN')) {
    const roles = user.roles.map(role => role.name);
    if (!roles.includes('ADMIN')) {
        throw new AuthenticationError();
    }

    const { id: testPlanRunId } = await createTestPlanRun({
        testPlanReportId,
        testerUserId
    });

    return populatedDataResolver({
        parentContext: { locationOfData: { testPlanReportId, testPlanRunId } }
    });
};

module.exports = assignTesterResolver;
