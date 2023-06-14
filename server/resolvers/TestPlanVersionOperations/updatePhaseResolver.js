const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanReport,
    getTestPlanReports
} = require('../../models/services/TestPlanReportService');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const recommendedStatusTargetDateResolver = require('../TestPlanVersion/recommendedStatusTargetDateResolver');
const populateData = require('../../services/PopulatedData/populateData');
const getMetrics = require('../../util/getMetrics');
const {
    getTestPlanVersionById,
    updateTestPlanVersion
} = require('../../models/services/TestPlanVersionService');

const updatePhaseResolver = async (
    { parentContext: { id: testPlanVersionId } },
    { phase, candidateStatusReachedAt, recommendedStatusTargetDate },
    context
) => {
    const { user } = context;
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const testPlanVersion = await getTestPlanVersionById(testPlanVersionId);

    // Move only the TestPlanReports which also have the same phase as the TestPlanVersion
    const whereTestPlanVersion = {
        testPlanVersionId
    };
    whereTestPlanVersion.status = testPlanVersion.phase;
    const testPlanReports = await getTestPlanReports(
        null,
        whereTestPlanVersion,
        null,
        null,
        null,
        null,
        null,
        null,
        {
            order: [['createdAt', 'desc']]
        }
    );

    for (let key in testPlanReports) {
        const testPlanReport = testPlanReports[key];
        const testPlanReportId = testPlanReport.id;

        // const testPlanReport = await getTestPlanReportById(testPlanReportId);
        const runnableTests = runnableTestsResolver(testPlanReport);

        // Params to be updated on TestPlanReport
        let updateParams = { phase, status: phase };

        if (phase !== 'DRAFT') {
            const conflicts = await conflictsResolver(
                testPlanReport,
                null,
                context
            );
            if (conflicts.length > 0) {
                throw new Error(
                    'Cannot update test plan report due to conflicts'
                );
            }
        }

        if (phase === 'CANDIDATE' || phase === 'RECOMMENDED') {
            const finalizedTestResults = await finalizedTestResultsResolver(
                {
                    ...testPlanReport,
                    phase,
                    status: phase
                },
                null,
                context
            );

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

            if (phase === 'CANDIDATE') {
                const candidateStatusReachedAtValue = candidateStatusReachedAt
                    ? candidateStatusReachedAt
                    : new Date();
                const recommendedStatusTargetDateValue =
                    recommendedStatusTargetDate
                        ? recommendedStatusTargetDate
                        : recommendedStatusTargetDateResolver({
                              candidateStatusReachedAt
                          });

                updateParams = {
                    ...updateParams,
                    metrics: { ...testPlanReport.metrics, ...metrics },
                    candidateStatusReachedAt: candidateStatusReachedAtValue,
                    recommendedStatusTargetDate:
                        recommendedStatusTargetDateValue,
                    vendorReviewStatus: 'READY'
                };
            } else if (phase === 'RECOMMENDED') {
                updateParams = {
                    ...updateParams,
                    metrics: { ...testPlanReport.metrics, ...metrics },
                    recommendedStatusReachedAt: new Date()
                };
            }
        }
        await updateTestPlanReport(testPlanReportId, updateParams);
        await updateTestPlanVersion(testPlanVersionId, updateParams);
    }

    return populateData({ testPlanVersionId }, { context });
};

module.exports = updatePhaseResolver;
