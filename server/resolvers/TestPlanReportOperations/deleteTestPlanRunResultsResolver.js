const { AuthenticationError } = require('apollo-server');
const {
    removeTestPlanRunResultsByQuery
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');

const deleteTestPlanRunResultsResolver = async (
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

    await removeTestPlanRunResultsByQuery({
        testPlanReportId,
        testerUserId
    });
    return populateData({ testPlanReportId });
};

module.exports = deleteTestPlanRunResultsResolver;
