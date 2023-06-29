const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanReport,
    getTestPlanReports
} = require('../../models/services/TestPlanReportService');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const recommendedPhaseTargetDateResolver = require('../TestPlanVersion/recommendedPhaseTargetDateResolver');
const populateData = require('../../services/PopulatedData/populateData');
const getMetrics = require('../../util/getMetrics');
const {
    getTestPlanVersionById,
    updateTestPlanVersion
} = require('../../models/services/TestPlanVersionService');

const updatePhaseResolver = async (
    { parentContext: { id: testPlanVersionId } },
    { phase, candidatePhaseReachedAt, recommendedPhaseTargetDate },
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

    // Params to be updated on TestPlanVersion (or TestPlanReports)
    let updateParams = { phase, status: phase };

    for (const key in testPlanReports) {
        const testPlanReport = testPlanReports[key];
        const testPlanReportId = testPlanReport.id;

        // const testPlanReport = await getTestPlanReportById(testPlanReportId);
        const runnableTests = runnableTestsResolver(testPlanReport);

        if (phase === 'CANDIDATE' || phase === 'RECOMMENDED') {
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
                updateParams = {
                    ...updateParams,
                    metrics: { ...testPlanReport.metrics, ...metrics },
                    vendorReviewStatus: 'READY'
                };
            } else if (phase === 'RECOMMENDED') {
                updateParams = {
                    ...updateParams,
                    metrics: { ...testPlanReport.metrics, ...metrics }
                };
            }
        }
        await updateTestPlanReport(testPlanReportId, updateParams);
    }

    if (phase === 'RD')
        updateParams = {
            ...updateParams,
            draftPhaseReachedAt: null,
            candidatePhaseReachedAt: null,
            recommendedPhaseReachedAt: null,
            recommendedPhaseTargetDate: null
        };
    else if (phase === 'DRAFT')
        // TODO: If there is an earlier version that is draft and that version has some test plan runs
        //  in the test queue, this button will run the process for updating existing reports and
        //  preserving data for tests that have not changed.
        updateParams = {
            ...updateParams,
            draftPhaseReachedAt: new Date(),
            candidatePhaseReachedAt: null,
            recommendedPhaseReachedAt: null,
            recommendedPhaseTargetDate: null
        };
    else if (phase === 'CANDIDATE') {
        // TODO: If there is an earlier version that is candidate and that version has some test
        //  plan runs in the test queue, this button will run the process for updating existing
        //  reports and preserving data for tests that have not changed.
        const candidatePhaseReachedAtValue =
            candidatePhaseReachedAt || new Date();
        const recommendedPhaseTargetDateValue =
            recommendedPhaseTargetDate ||
            recommendedPhaseTargetDateResolver({
                candidatePhaseReachedAt
            });
        updateParams = {
            ...updateParams,
            candidatePhaseReachedAt: candidatePhaseReachedAtValue,
            recommendedPhaseReachedAt: null,
            recommendedPhaseTargetDate: recommendedPhaseTargetDateValue
        };
    } else if (phase === 'RECOMMENDED')
        // TODO: If there is an earlier version that is recommended and that version has some test
        //  plan runs in the test queue, this button will run the process for updating existing
        //  reports and preserving data for tests that have not changed.
        updateParams = {
            ...updateParams,
            recommendedPhaseReachedAt: new Date()
        };

    await updateTestPlanVersion(testPlanVersionId, updateParams);
    return populateData({ testPlanVersionId }, { context });
};

module.exports = updatePhaseResolver;
