const {
    createTestPlanRun,
} = require('../../models/services/TestPlanRunService');

const assignTesterResolver = async (
    { parentContext: { id: testPlanReportId } },
    { user: testerUserId }
) => {
    await createTestPlanRun({
        testPlanReportId,
        testerUserId,
    });
    return { parentContext: { id: testPlanReportId } };
};

module.exports = assignTesterResolver;
