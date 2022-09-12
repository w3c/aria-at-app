const { AuthenticationError } = require('apollo-server');
const {
    getTestPlanReportById,
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const recommendedStatusTargetDateResolver = require('../TestPlanReport/recommendedStatusTargetDateResolver');
const populateData = require('../../services/PopulatedData/populateData');

const updateStatusResolver = async (
    { parentContext: { id: testPlanReportId } },
    { status },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const testPlanReport = await getTestPlanReportById(testPlanReportId);

    let updateParams = { status };
    if (status === 'IN_REVIEW') {
        const candidateStatusReachedAt = new Date();
        updateParams = {
            ...updateParams,
            candidateStatusReachedAt,
            recommendedStatusTargetDate: recommendedStatusTargetDateResolver({
                candidateStatusReachedAt
            })
        };
    } else if (status === 'FINALIZED') {
        const conflicts = await conflictsResolver(testPlanReport);
        if (conflicts.length > 0) {
            throw new Error(
                'Cannot finalize test plan report due to conflicts'
            );
        }

        const finalizedTestResults = finalizedTestResultsResolver({
            ...testPlanReport,
            status: 'FINALIZED'
        });
        if (!finalizedTestResults || !finalizedTestResults.length) {
            throw new Error(
                'Cannot finalize test plan report because there are no ' +
                    'completed test results'
            );
        }
        updateParams = {
            ...updateParams,
            recommendedStatusReachedAt: new Date()
        };
    }
    await updateTestPlanReport(testPlanReportId, updateParams);

    return populateData({ testPlanReportId });
};

module.exports = updateStatusResolver;
