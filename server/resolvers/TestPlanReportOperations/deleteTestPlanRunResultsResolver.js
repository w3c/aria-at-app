const { AuthenticationError } = require('apollo-server');
const {
    removeTestPlanRunResultsByQuery
} = require('../../models/services/TestPlanRunService');
const populatedDataResolver = require('../PopulatedData');

const deleteTestPlanRunResultsResolver = async (
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
    await removeTestPlanRunResultsByQuery({
        testPlanReportId,
        testerUserId
    });
    return populatedDataResolver({
        parentContext: { locationOfData: { testPlanReportId } }
    });
};

module.exports = deleteTestPlanRunResultsResolver;
