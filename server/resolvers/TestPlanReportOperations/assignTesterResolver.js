const { AuthenticationError, UserInputError } = require('apollo-server');
const {
    createTestPlanRun
} = require('../../models/services/TestPlanRunService');
const populateData = require('../../services/PopulatedData/populateData');

const assignTesterResolver = async (
    { parentContext: { id: testPlanReportId } },
    { userId: testerUserId },
    { user }
) => {
    if (
        !(
            user?.roles.find(role => role.name === 'ADMIN') ||
            (user?.roles.find(role => role.name === 'TESTER') &&
                testerUserId == user.id)
        )
    ) {
        throw new AuthenticationError();
    }

    const { testPlanReport } = await populateData({ testPlanReportId });

    if (testPlanReport.status !== 'DRAFT') {
        throw new UserInputError(
            'Test plan report can only be changed while in a draft state.'
        );
    }

    const { id: testPlanRunId } = await createTestPlanRun({
        testPlanReportId,
        testerUserId
    });

    return populateData({ testPlanRunId });
};

module.exports = assignTesterResolver;
