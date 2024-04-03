const { AuthenticationError } = require('apollo-server-errors');
const {
    createTestPlanReport,
    getTestPlanReports
} = require('../models/services/TestPlanReportService');
const populateData = require('../services/PopulatedData/populateData');

const createTestPlanReportResolver = async (_, { input }, context) => {
    const { user, transaction } = context;

    // TODO: remove code related to conflictingReports which is meant to be
    // temporary until the frontend fully supports duplicate AT / Browsers
    // for TestPlanReports.
    // START TEMPORARY CODE
    const conflictingReports = await getTestPlanReports({
        where: {
            testPlanVersionId: input.testPlanVersionId,
            atId: input.atId,
            browserId: input.browserId
        },
        transaction
    });
    if (conflictingReports.length) {
        throw new Error(
            'Temporarily, creating duplicate reports for a AT / browser ' +
                'combination is not allowed'
        );
    }
    // END TEMPORARY CODE

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const testPlanReport = await createTestPlanReport({
        values: input,
        transaction
    });

    const locationOfData = { testPlanReportId: testPlanReport.id };
    const preloaded = { testPlanReport };

    return populateData(locationOfData, { preloaded, context });
};

module.exports = createTestPlanReportResolver;
