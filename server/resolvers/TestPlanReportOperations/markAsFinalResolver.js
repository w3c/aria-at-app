const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const populateData = require('../../services/PopulatedData/populateData');

const markAsFinalResolver = async (
    { parentContext: { id: testPlanReportId } },
    _,
    context
) => {
    const { user } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    await updateTestPlanReport(testPlanReportId, { approvedAt: new Date() });

    return populateData({ testPlanReportId }, { context });
};

module.exports = markAsFinalResolver;
