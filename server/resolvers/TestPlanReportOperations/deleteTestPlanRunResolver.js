const { AuthenticationError } = require('apollo-server');
const {
    removeTestPlanRunByQuery
} = require('../../models/services/TestPlanRunService');
const populatedDataResolver = require('../PopulatedData');

const deleteTestPlanRunResolver = async (
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
    await removeTestPlanRunByQuery({
        testPlanReportId,
        testerUserId
    });
    return populatedDataResolver({
        parentContext: { locationOfData: { testPlanReportId } }
    });
};

module.exports = deleteTestPlanRunResolver;
