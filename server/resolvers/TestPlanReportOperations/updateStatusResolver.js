const { AuthenticationError } = require('apollo-server');
const {
    getTestPlanReportById,
    updateTestPlanReport
} = require('../../models/services/TestPlanReportService');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const recommendedStatusTargetDateResolver = require('../TestPlanReport/recommendedStatusTargetDateResolver');
const populateData = require('../../services/PopulatedData/populateData');
const getMetrics = require('../../util/getMetrics');

const updateStatusResolver = async (
    { parentContext: { id: testPlanReportId } },
    { status },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const testPlanReport = await getTestPlanReportById(testPlanReportId);
    const runnableTests = runnableTestsResolver(testPlanReport);

    // Params to be updated on TestPlanReport
    let updateParams = { status };

    if (status === 'IN_REVIEW') {
        const conflicts = await conflictsResolver(testPlanReport);
        if (conflicts.length > 0) {
            throw new Error('Cannot update test plan report due to conflicts');
        }

        const finalizedTestResults = finalizedTestResultsResolver({
            ...testPlanReport,
            status
        });

        if (!finalizedTestResults || !finalizedTestResults.length) {
            throw new Error(
                'Cannot update test plan report because there are no ' +
                    'completed test results'
            );
        }

        const metrics = getMetrics({
            testPlanReport: {
                ...testPlanReport,
                finalizedTestResults,
                runnableTests
            }
        });

        const candidateStatusReachedAt = new Date();
        updateParams = {
            ...updateParams,
            candidateStatusReachedAt,
            metrics: { ...testPlanReport.metrics, ...metrics },
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
            status
        });

        if (!finalizedTestResults || !finalizedTestResults.length) {
            throw new Error(
                'Cannot finalize test plan report because there are no ' +
                    'completed test results'
            );
        }

        const metrics = getMetrics({
            testPlanReport: {
                ...testPlanReport,
                finalizedTestResults,
                runnableTests
            }
        });

        updateParams = {
            ...updateParams,
            metrics: { ...testPlanReport.metrics, ...metrics },
            recommendedStatusReachedAt: new Date()
        };
    }
    await updateTestPlanReport(testPlanReportId, updateParams);

    return populateData({ testPlanReportId });
};

module.exports = updateStatusResolver;
