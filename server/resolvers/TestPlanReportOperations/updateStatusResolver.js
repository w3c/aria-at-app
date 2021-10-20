const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const populateData = require('../../services/PopulatedData/populateData');

const updateStatusResolver = async (
    { parentContext: { id: testPlanReportId } },
    { status: status },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const { testPlanReport } = await populateData({ testPlanReportId });

    if (status === 'FINALIZED' || status === 'IN_REVIEW') {
        const conflicts = await conflictsResolver(testPlanReport);
        if (conflicts.length > 0) {
            throw new Error(
                'Cannot change test plan report status due to conflicts'
            );
        }

        const finalizedTestResults = finalizedTestResultsResolver({
            ...testPlanReport,
            status
        });
        if (finalizedTestResults.length === 0) {
            throw new Error(
                'Cannot change test plan report status because there are no ' +
                    'completed test results'
            );
        }
    }

    await updateTestPlanReport(testPlanReportId, { status });

    return populateData({ testPlanReportId });
};

module.exports = updateStatusResolver;
