const {
    getOrCreateTestPlanReport
} = require('../models/services/TestPlanReportService');
const populatedDataResolver = require('./PopulatedData');

const findOrCreateTestPlanReportResolver = async (_, { input }) => {
    const [result, createdLocationsOfData] = await getOrCreateTestPlanReport(
        input,
        { status: 'DRAFT' },
        null,
        [],
        [],
        [],
        []
    );

    const locationOfData = { testPlanReportId: result.id };

    return {
        populatedData: await populatedDataResolver({
            parentContext: { locationOfData }
        }),
        created: await Promise.all(
            createdLocationsOfData.map(locationOfData =>
                populatedDataResolver({ parentContext: { locationOfData } })
            )
        )
    };
};

module.exports = findOrCreateTestPlanReportResolver;
