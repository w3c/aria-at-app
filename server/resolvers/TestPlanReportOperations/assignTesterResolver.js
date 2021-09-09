const { AuthenticationError } = require('apollo-server');
const {
    createTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');

const assignTesterResolver = async (
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

    const { id: testPlanRunId } = await createTestPlanRun({
        testPlanReportId,
        testerUserId
    });

    return populateData({ testPlanRunId });
};

module.exports = assignTesterResolver;
