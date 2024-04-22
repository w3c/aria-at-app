const { AuthenticationError, UserInputError } = require('apollo-server-errors');
const {
    createTestPlanReport
} = require('../models/services/TestPlanReportService');
const populateData = require('../services/PopulatedData/populateData');

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

    const testPlanReport = await createTestPlanReport({
        values: input,
        transaction
    });

    const locationOfData = { testPlanReportId: testPlanReport.id };
    const preloaded = { testPlanReport };

    return populateData(locationOfData, { preloaded, context });
};

module.exports = createTestPlanReportResolver;
