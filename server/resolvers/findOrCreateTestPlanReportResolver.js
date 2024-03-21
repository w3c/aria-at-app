const { AuthenticationError } = require('apollo-server-errors');
const {
    getOrCreateTestPlanReport
} = require('../models/services/TestPlanReportService');
const {
    getTestPlanVersionById,
    getTestPlanVersions
} = require('../models/services/TestPlanVersionService');
const populateData = require('../services/PopulatedData/populateData');
const processCopiedReports = require('./helpers/processCopiedReports');

const findOrCreateTestPlanReportResolver = async (_, { input }, context) => {
    const { user, transaction } = context;

    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    // Pull back report from TestPlanVersion in advanced phase and run through processCopiedReports if not deprecated
    const { directory, updatedAt } = await getTestPlanVersionById({
        id: input.testPlanVersionId,
        testPlanVersionAttributes: ['directory', 'updatedAt'],
        testPlanReportAttributes: [],
        atAttributes: [],
        browserAttributes: [],
        testPlanRunAttributes: [],
        userAttributes: [],
        transaction
    });

    const otherTestPlanVersions = await getTestPlanVersions({
        where: { directory, phase: ['CANDIDATE', 'RECOMMENDED'] },
        transaction
    });

    const latestOtherVersion = otherTestPlanVersions.reduce((a, b) =>
        new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
    );

    if (new Date(latestOtherVersion.updatedAt) < new Date(updatedAt)) {
        const matchingReportToCopyResults =
            latestOtherVersion.testPlanReports.find(
                ({ atId, browserId }) =>
                    atId == input.atId && browserId == input.browserId
            );

        if (matchingReportToCopyResults) {
            const { updatedTestPlanReports } = await processCopiedReports({
                oldTestPlanVersionId: latestOtherVersion.id,
                newTestPlanVersionId: input.testPlanVersionId,
                newTestPlanReports: [],
                atBrowserCombinations: [`${input.atId}_${input.browserId}`],
                context
            });

            if (updatedTestPlanReports?.length) {
                const locationOfData = {
                    testPlanReportId: updatedTestPlanReports[0].id
                };
                const preloaded = {
                    testPlanReport: updatedTestPlanReports[0].id
                };

                const createdLocationsOfData = [
                    { testPlanReportId: updatedTestPlanReports[0].id }
                ];

                return {
                    populatedData: await populateData(locationOfData, {
                        preloaded,
                        transaction
                    }),
                    created: []
                    // created: await Promise.all(
                    //     createdLocationsOfData.map(createdLocationOfData =>
                    //         populateData(createdLocationOfData, {
                    //             preloaded,
                    //             transaction
                    //         })
                    //     )
                    // )
                };
            }
        }
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
