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
    const roles = user.roles.map(role => role.name);

    // prettier-ignore
    if (
        !roles.includes('ADMIN') &&
        (roles.includes('TESTER') && testerUserId === user.id)
    ) {
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
