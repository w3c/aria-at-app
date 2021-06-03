const {
    getOrCreateTestPlanReport
} = require('../models/services/TestPlanReportService');

const findOrCreateTestPlanReportResolver = async (_, { input }) => {
    const [result, createdLocationsOfData] = getOrCreateTestPlanReport(
        input,
        null,
        [],
        [],
        [],
        []
    );

    const locationOfData = { testPlanReportId: result.id };

    return {
        populatedData: { parentContext: { locationOfData } },
        created: createdLocationsOfData.map(locationOfData => ({
            parentContext: { locationOfData }
        }))
    };
};

module.exports = findOrCreateTestPlanReportResolver;
