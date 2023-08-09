const { AuthenticationError } = require('apollo-server');
const {
    getTestPlanReportById,
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
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

    const testPlanReport = await getTestPlanReportById(testPlanReportId);

    const finalizedTestResults = await finalizedTestResultsResolver(
        {
            ...testPlanReport
        },
        null,
        context
    );

    if (!finalizedTestResults || !finalizedTestResults.length) {
        throw new Error(
            'Cannot mark test plan report as final because there are no ' +
                'completed test results'
        );
    }

    await updateTestPlanReport(testPlanReportId, { approvedAt: new Date() });

    return populateData({ testPlanReportId }, { context });
};

module.exports = markAsFinalResolver;
