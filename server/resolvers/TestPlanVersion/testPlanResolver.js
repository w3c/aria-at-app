const { getTestPlanById } = require('../../models/services/TestPlanService');

const testPlanResolver = async (testPlanVersion, _, context, info) => {
    const { t } = context;

    const requestedFields =
        info?.fieldNodes[0] &&
        info.fieldNodes[0].selectionSet.selections.map(
            selection => selection.name.value
        );
    const includeLatest = !!requestedFields?.includes('latestTestPlanVersion');

    let latestTestPlanVersion = { latestTestPlanVersion: null };

    if (includeLatest) {
        latestTestPlanVersion = await getTestPlanById({
            id: testPlanVersion.directory,
            testPlanVersionAttributes: [],
            t
        });
    }

    return {
        id: testPlanVersion.directory,
        directory: testPlanVersion.directory,
        latestTestPlanVersion: latestTestPlanVersion.latestTestPlanVersion
    };
};

module.exports = testPlanResolver;
