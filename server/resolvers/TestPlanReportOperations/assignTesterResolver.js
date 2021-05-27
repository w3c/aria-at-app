const { AuthenticationError } = require('apollo-server');
const {
    createTestPlanRun
} = require('../../models/services/TestPlanRunService');

const assignTesterResolver = async (
    { parentContext: { id: testPlanReportId } },
    { user: testerUserId },
    { user }
) => {
    if (!user.roles.includes('ADMIN')) {
        throw new AuthenticationError();
    }

    await createTestPlanRun({
        testPlanReportId,
        testerUserId
    });
    return { parentContext: { id: testPlanReportId } };
};

module.exports = assignTesterResolver;
