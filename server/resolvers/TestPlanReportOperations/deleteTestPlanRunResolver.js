const { AuthenticationError } = require('apollo-server');

const {
    removeTestPlanRunByQuery
} = require('../../models/services/TestPlanRunService');

const deleteTestPlanRunResolver = async (
    { parentContext: { id: testPlanReportId } },
    { user: testerUserId },
    { user }
) => {
    if (!user.roles.includes('ADMIN')) {
        throw new AuthenticationError();
    }
    await removeTestPlanRunByQuery({
        testPlanReportId,
        testerUserId
    });
    return { parentContext: { id: testPlanReportId } };
};

module.exports = deleteTestPlanRunResolver;
