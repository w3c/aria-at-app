const { AuthenticationError, UserInputError } = require('apollo-server-errors');
const {
    createTestPlanReport
} = require('../models/services/TestPlanReportService');
const populateData = require('../services/PopulatedData/populateData');
const processCopiedReports = require('./helpers/processCopiedReports');

const createTestPlanReportResolver = async (_, { input }, context) => {
    const { user, transaction } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    if (!(input.exactAtVersionId || input.minimumAtVersionId)) {
        throw new UserInputError(
            'Missing either an exact AT version or a minimum AT version'
        );
    }

    // Pull back report from TestPlanVersion in advanced phase and run through processCopiedReports if not deprecated
    const { copyResultsFromTestPlanVersionId, ...values } = input;

    let testPlanReport;

    if (copyResultsFromTestPlanVersionId) {
        const { updatedTestPlanReports } = await processCopiedReports({
            oldTestPlanVersionId: copyResultsFromTestPlanVersionId,
            newTestPlanVersionId: input.testPlanVersionId,
            newTestPlanReports: [],
            atBrowserCombinationsToInclude: [
                { atId: input.atId, browserId: input.browserId }
            ],
            context
        });

        if (updatedTestPlanReports?.length) {
            // Expecting only to get back the single requested combination
            testPlanReport = updatedTestPlanReports[0];
        } else {
            testPlanReport = await createTestPlanReport({
                values,
                transaction
            });
        }
    } else {
        testPlanReport = await createTestPlanReport({ values, transaction });
    }

    const locationOfData = { testPlanReportId: testPlanReport.id };
    const preloaded = { testPlanReport };

    return populateData(locationOfData, { preloaded, context });
};

module.exports = createTestPlanReportResolver;
