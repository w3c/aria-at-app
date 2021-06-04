const {
    getOrCreateTestPlanReport
} = require('../models/services/TestPlanReportService');
const populateDataResolver = require('./populateDataResolver');

const findOrCreateTestPlanReportResolver = async (_, { input }) => {
    const [result, createdLocationsOfData] = await getOrCreateTestPlanReport(
        input,
        { status: 'DRAFT' },
        [],
        [],
        [],
        [],
        []
    );

    const locationOfData = { testPlanReportId: result.id };

    return {
        populatedData: await populateDataResolver({
            parentContext: { locationOfData }
        }),
        created: await Promise.all(
            createdLocationsOfData.map(locationOfData =>
                populateDataResolver({ parentContext: { locationOfData } })
            )
        )
    };
};

module.exports = findOrCreateTestPlanReportResolver;
