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
    const roles = user.roles.map(role => role.name);

    // prettier-ignore
    if (
        !roles.includes('ADMIN') &&
        (roles.includes('TESTER') && testerUserId === user.id)
    ) {
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
