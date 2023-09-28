const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const populateData = require('../../services/PopulatedData/populateData');

const unmarkAsFinalResolver = async (
    { parentContext: { id: testPlanReportId } },
    _,
    context
) => {
    const { user } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    await updateTestPlanReport(testPlanReportId, { markedFinalAt: null });

    return populateData({ testPlanReportId }, { context });
};

module.exports = unmarkAsFinalResolver;
