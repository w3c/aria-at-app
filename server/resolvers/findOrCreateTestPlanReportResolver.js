const { AuthenticationError } = require('apollo-server-errors');
const {
    getOrCreateTestPlanReport
} = require('../models/services/TestPlanReportService');
const populateData = require('../services/PopulatedData/populateData');

const findOrCreateTestPlanReportResolver = async (_, { input }, context) => {
    const { user } = context;
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const [testPlanReport, createdLocationsOfData] =
        await getOrCreateTestPlanReport(input, { status: 'DRAFT' });

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
