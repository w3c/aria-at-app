const { AuthenticationError } = require('apollo-server');
const {
    removeTestPlanRunByQuery
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');

const deleteTestPlanRunResolver = async (
    { parentContext: { id: testPlanReportId } },
    { userId: testerUserId },
    { user }
) => {
    const roles = user ? user.roles.map(role => role.name) : [];
    if (
        !(
            roles.includes('ADMIN') ||
            (roles.includes('TESTER') && testerUserId === user.id)
        )
    ) {
        throw new AuthenticationError();
    }

    await removeTestPlanRunByQuery({
        testPlanReportId,
        testerUserId
    });
    return populateData({ testPlanReportId });
};

module.exports = deleteTestPlanRunResolver;
