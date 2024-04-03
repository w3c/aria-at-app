const { AuthenticationError } = require('apollo-server-errors');
const {
    getOrCreateTestPlanReport
} = require('../models/services/TestPlanReportService');
const populateData = require('../services/PopulatedData/populateData');
const processCopiedReports = require('./helpers/processCopiedReports');

const findOrCreateTestPlanReportResolver = async (_, { input }, context) => {
    const { user, transaction } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    // Pull back report from TestPlanVersion in advanced phase and run through processCopiedReports if not deprecated
    const { copyResultsFromTestPlanReportId } = input;

    if (copyResultsFromTestPlanReportId) {
        const { updatedTestPlanReports } = await processCopiedReports({
            oldTestPlanVersionId: copyResultsFromTestPlanReportId,
            newTestPlanVersionId: input.testPlanVersionId,
            newTestPlanReports: [],
            atBrowserCombinationsToInclude: [
                { atId: input.atId, browserId: input.browserId }
            ],
            context
        });

        if (updatedTestPlanReports?.length) {
            // Expecting only to get back the single requested combination
            const [testPlanReport] = updatedTestPlanReports;

            const locationOfData = {
                testPlanReportId: testPlanReport.id
            };
            const preloaded = {
                testPlanReport
            };
            const createdLocationsOfData = [locationOfData];

            return {
                populatedData: await populateData(locationOfData, {
                    preloaded,
                    context
                }),
                created: await Promise.all(
                    createdLocationsOfData.map(createdLocationOfData =>
                        populateData(createdLocationOfData, {
                            preloaded,
                            context
                        })
                    )
                )
            };
        }
    }

    const [testPlanReport, createdLocationsOfData] =
        await getOrCreateTestPlanReport({ where: input, transaction });

    const locationOfData = { testPlanReportId: testPlanReport.id };
    const preloaded = { testPlanReport };

    return {
        populatedData: await populateData(locationOfData, {
            preloaded,
            context
        }),
        created: await Promise.all(
            createdLocationsOfData.map(createdLocationOfData =>
                populateData(createdLocationOfData, { preloaded, context })
            )
        )
    };
};

module.exports = findOrCreateTestPlanReportResolver;
