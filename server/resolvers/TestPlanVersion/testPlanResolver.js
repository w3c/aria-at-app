const {
    getTestPlanById
} = require('../../models/services/TestPlanVersionService');

const testPlanResolver = async (testPlanVersion, args, context, info) => {
    const requestedFields =
        info?.fieldNodes[0] &&
        info.fieldNodes[0].selectionSet.selections.map(
            selection => selection.name.value
        );
    const includeLatest = !!requestedFields?.includes('latestTestPlanVersion');

    let latestTestPlanVersion = { latestTestPlanVersion: null };

    if (includeLatest) {
        latestTestPlanVersion = await getTestPlanById(
            testPlanVersion.directory,
            {
                includeTestPlanVersions: false
            }
        );
    }

    return {
        id: testPlanVersion.directory,
        directory: testPlanVersion.directory,
        latestTestPlanVersion: latestTestPlanVersion.latestTestPlanVersion
    };
};

module.exports = testPlanResolver;
