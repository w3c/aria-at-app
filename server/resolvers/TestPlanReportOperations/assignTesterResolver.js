const { AuthenticationError } = require('apollo-server');
const {
    createTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');

const assignTesterResolver = async (
    { parentContext: { id: testPlanReportId } },
    { userId: testerUserId },
    context
) => {
    const { user } = context;
    if (
        !(
            user?.roles.find(role => role.name === 'ADMIN') ||
            (user?.roles.find(role => role.name === 'TESTER') &&
                testerUserId == user.id)
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
