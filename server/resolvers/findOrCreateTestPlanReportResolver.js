const { AuthenticationError } = require('apollo-server-errors');
const {
    getOrCreateTestPlanReport
} = require('../models/services.deprecated/TestPlanReportService');
const populateData = require('../services/PopulatedData/populateData');

const findOrCreateTestPlanReportResolver = async (_, { input }, context) => {
    const { user, transaction } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const [testPlanReport, createdLocationsOfData] =
        await getOrCreateTestPlanReport({ where: input, transaction });

    const locationOfData = { testPlanReportId: testPlanReport.id };
    const preloaded = { testPlanReport };

    return {
        populatedData: await populateData(locationOfData, {
            preloaded,
            transaction
        }),
        created: await Promise.all(
            createdLocationsOfData.map(createdLocationOfData =>
                populateData(createdLocationOfData, { preloaded, transaction })
            )
        )
    };
};

module.exports = findOrCreateTestPlanReportResolver;
