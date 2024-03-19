const { AuthenticationError } = require('apollo-server');
const {
    updateTestPlanReportById,
    getTestPlanReports,
    removeTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const conflictsResolver = require('../TestPlanReport/conflictsResolver');
const finalizedTestResultsResolver = require('../TestPlanReport/finalizedTestResultsResolver');
const runnableTestsResolver = require('../TestPlanReport/runnableTestsResolver');
const recommendedPhaseTargetDateResolver = require('../TestPlanVersion/recommendedPhaseTargetDateResolver');
const populateData = require('../../services/PopulatedData/populateData');
const { getMetrics } = require('shared');
const {
    updateTestPlanVersionById
} = require('../../models/services/TestPlanVersionService');
const AtLoader = require('../../models/loaders/AtLoader');
const processCopiedReports = require('../helpers/processCopiedReports');

const updatePhaseResolver = async (
    { parentContext: { id: testPlanVersionId } },
    {
        phase,
        candidatePhaseReachedAt,
        recommendedPhaseTargetDate,
        testPlanVersionDataToIncludeId
    },
    context
) => {
    const { user, transaction } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    // Immediately deprecate version without further checks
    if (phase === 'DEPRECATED') {
        await updateTestPlanVersionById({
            id: testPlanVersionId,
            values: { phase, deprecatedAt: new Date() },
            transaction
        });
        return populateData({ testPlanVersionId }, { transaction });
    }

    // The test plan reports which will be updated
    let testPlanReports = await getTestPlanReports({
        where: { testPlanVersionId },
        testPlanRunAttributes: null,
        testPlanVersionAttributes: null,
        testPlanAttributes: null,
        atAttributes: null,
        browserAttributes: null,
        userAttributes: null,
        pagination: { order: [['createdAt', 'desc']] },
        transaction
    });

    const { oldTestPlanVersion, newTestPlanReportIds, updatedTestPlanReports } =
        await processCopiedReports({
            oldTestPlanVersionId: testPlanVersionDataToIncludeId,
            newTestPlanVersionId: testPlanVersionId,
            newTestPlanReports: testPlanReports,
            context
        });
    if (updatedTestPlanReports) testPlanReports = updatedTestPlanReports;

    if (
        testPlanReports.length === 0 &&
        (phase === 'CANDIDATE' || phase === 'RECOMMENDED')
    ) {
        // Stop update if no testPlanReports were found
        throw new Error('No test plan reports found.');
    }

    // If there is at least one report that wasn't created by the old reports then do the exception
    // check
    if (testPlanReports.some(({ id }) => !newTestPlanReportIds.includes(id))) {
        if (
            !testPlanReports.some(({ markedFinalAt }) => markedFinalAt) &&
            (phase === 'CANDIDATE' || phase === 'RECOMMENDED')
        ) {
            // Throw away newly created test plan reports if exception was hit
            if (newTestPlanReportIds.length)
                for (const createdTestPlanReportId of newTestPlanReportIds) {
                    await removeTestPlanReportById({
                        id: createdTestPlanReportId,
                        transaction
                    });
                }

            // Do not update phase if no reports marked as final were found
            throw new Error('No reports have been marked as final.');
        }
    }

    if (phase === 'CANDIDATE') {
        const reportsByAtAndBrowser = {};

        testPlanReports
            // Only check for reports which have been marked as final
            .filter(testPlanReport => !!testPlanReport.markedFinalAt)
            .forEach(testPlanReport => {
                const { at, browser } = testPlanReport;
                if (!reportsByAtAndBrowser[at.id]) {
                    reportsByAtAndBrowser[at.id] = {};
                }

                reportsByAtAndBrowser[at.id][browser.id] = testPlanReport;
            });

        const atLoader = AtLoader();
        const ats = await atLoader.getAll({ transaction });

        const missingAtBrowserCombinations = [];

        ats.forEach(at => {
            const browsers =
                phase === 'CANDIDATE'
                    ? at.candidateBrowsers
                    : at.recommendedBrowsers;
            browsers.forEach(browser => {
                if (!reportsByAtAndBrowser[at.id]?.[browser.id]) {
                    missingAtBrowserCombinations.push(
                        `${at.name} and ${browser.name}`
                    );
                }
            });
        });

        if (missingAtBrowserCombinations.length) {
            // Throw away newly created test plan reports if exception was hit
            if (newTestPlanReportIds.length)
                for (const createdTestPlanReportId of newTestPlanReportIds) {
                    await removeTestPlanReportById({
                        id: createdTestPlanReportId,
                        transaction
                    });
                }

            throw new Error(
                `Cannot set phase to ${phase.toLowerCase()} because the following` +
                    ` required reports have not been collected or finalized:` +
                    ` ${missingAtBrowserCombinations.join(', ')}.`
            );
        }
    }

    for (const testPlanReport of testPlanReports) {
        const runnableTests = runnableTestsResolver(
            testPlanReport,
            null,
            context
        );
        let updateParams = {};

        const isReportCreatedFromOldResults = newTestPlanReportIds.includes(
            testPlanReport.id
        );

        if (phase === 'DRAFT') {
            const conflicts = await conflictsResolver(
                testPlanReport,
                null,
                context
            );

            updateParams = {
                metrics: {
                    ...testPlanReport.metrics,
                    conflictsCount: conflicts.length
                }
            };

            // Nullify markedFinalAt if not using old result
            if (!isReportCreatedFromOldResults)
                updateParams = { ...updateParams, markedFinalAt: null };

            await updateTestPlanReportById({
                id: testPlanReport.id,
                values: updateParams,
                transaction
            });
        }

        const shouldThrowErrorIfFound =
            (phase === 'CANDIDATE' || phase === 'RECOMMENDED') &&
            isReportCreatedFromOldResults
                ? false
                : testPlanReport.markedFinalAt;

        if (shouldThrowErrorIfFound) {
            const conflicts = await conflictsResolver(
                testPlanReport,
                null,
                context
            );
            if (conflicts.length > 0) {
                // Throw away newly created test plan reports if exception was hit
                if (newTestPlanReportIds.length)
                    for (const createdTestPlanReportId of newTestPlanReportIds) {
                        await removeTestPlanReportById({
                            id: createdTestPlanReportId,
                            transaction
                        });
                    }

                throw new Error(
                    'Cannot update test plan report due to conflicts'
                );
            }

            const finalizedTestResults = await finalizedTestResultsResolver(
                testPlanReport,
                null,
                context
            );

            if (!finalizedTestResults || !finalizedTestResults.length) {
                // Throw away newly created test plan reports if exception was hit
                if (newTestPlanReportIds.length)
                    for (const createdTestPlanReportId of newTestPlanReportIds) {
                        await removeTestPlanReportById({
                            id: createdTestPlanReportId,
                            transaction
                        });
                    }

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
        await updateTestPlanReportById({
            id: testPlanReport.id,
            values: updateParams,
            transaction
        });
    }

    let updateParams = { phase };
    if (phase === 'RD')
        updateParams = {
            ...updateParams,
            draftPhaseReachedAt: null,
            candidatePhaseReachedAt: null,
            recommendedPhaseReachedAt: null,
            recommendedPhaseTargetDate: null,
            deprecatedAt: null
        };
    else if (phase === 'DRAFT')
        updateParams = {
            ...updateParams,
            draftPhaseReachedAt: new Date(),
            candidatePhaseReachedAt: null,
            recommendedPhaseReachedAt: null,
            recommendedPhaseTargetDate: null,
            deprecatedAt: null
        };
    else if (phase === 'CANDIDATE') {
        // Preserve candidate phase related dates from older TestPlanVersion since not yet gone to
        // recommended
        const {
            candidatePhaseReachedAt: oldCandidatePhaseReachedAtDate,
            recommendedPhaseTargetDate: oldRecommendedPhaseTargetDate
        } = oldTestPlanVersion || {};

        const candidatePhaseReachedAtValue =
            oldCandidatePhaseReachedAtDate ||
            candidatePhaseReachedAt ||
            new Date();
        const recommendedPhaseTargetDateValue =
            oldRecommendedPhaseTargetDate ||
            recommendedPhaseTargetDate ||
            recommendedPhaseTargetDateResolver(
                { candidatePhaseReachedAt: candidatePhaseReachedAtValue },
                null,
                context
            );
        updateParams = {
            ...updateParams,
            candidatePhaseReachedAt: candidatePhaseReachedAtValue,
            recommendedPhaseReachedAt: null,
            recommendedPhaseTargetDate: recommendedPhaseTargetDateValue,
            deprecatedAt: null
        };
    } else if (phase === 'RECOMMENDED')
        updateParams = {
            ...updateParams,
            recommendedPhaseReachedAt: new Date(),
            deprecatedAt: null
        };

    // If testPlanVersionDataToIncludeId's results are being used to update this earlier version,
    // deprecate it
    if (testPlanVersionDataToIncludeId)
        await updateTestPlanVersionById({
            id: testPlanVersionDataToIncludeId,
            values: { phase: 'DEPRECATED', deprecatedAt: new Date() },
            transaction
        });

    await updateTestPlanVersionById({
        id: testPlanVersionId,
        values: updateParams,
        transaction
    });
    return populateData({ testPlanVersionId }, { transaction });
};

module.exports = updatePhaseResolver;
