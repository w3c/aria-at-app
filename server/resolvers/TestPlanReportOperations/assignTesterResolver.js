const { AuthenticationError } = require('apollo-server');
const {
    createTestPlanRun,
    updateTestPlanRun
} = require('../../models/services.deprecated/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');

const assignTesterResolver = async (
    { parentContext: { id: testPlanReportId } },
    { userId: testerUserId, testPlanRunId },
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
    // If testPlanRunId is provided reassign the tester to the testPlanRun
    if (testPlanRunId) {
        await updateTestPlanRun(testPlanRunId, {
            testerUserId
        });
    } else {
        const { id } = await createTestPlanRun({
            testPlanReportId,
            testerUserId
        });
        testPlanRunId = id;
    }

    return populateData({ testPlanRunId });
};

module.exports = assignTesterResolver;
