const {
    removeTestPlanRunByQuery
} = require('../../models/services/TestPlanRunService');

const deleteTestPlanRunResolver = async (
    { parentContext: { id: testPlanReportId } },
    { user: testerUserId }
) => {
    await removeTestPlanRunByQuery({
        testPlanReportId,
        testerUserId
    });
    return { parentContext: { id: testPlanReportId } };
};

module.exports = deleteTestPlanRunResolver;
