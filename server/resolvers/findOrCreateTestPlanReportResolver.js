const { AuthenticationError } = require('apollo-server-errors');
const {
    getOrCreateTestPlanReport
} = require('../models/services/TestPlanReportService');
const populateData = require('../services/PopulatedData/populateData');

const findOrCreateTestPlanReportResolver = async (_, { input }, { user }) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        return new AuthenticationError();
    }

    const [
        testPlanReport,
        createdLocationsOfData
    ] = await getOrCreateTestPlanReport(input, { status: 'DRAFT' });

    const locationOfData = { testPlanReportId: testPlanReport.id };
    const preloaded = { testPlanReport };

    return {
        populatedData: await populateData(locationOfData, { preloaded }),
        created: await Promise.all(
            createdLocationsOfData.map(createdLocationOfData =>
                populateData(createdLocationOfData, { preloaded })
            )
        )
    };
};

module.exports = findOrCreateTestPlanReportResolver;
