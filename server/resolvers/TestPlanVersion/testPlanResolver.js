const { getTestPlanById } = require('../../models/services/TestPlanService');

const testPlanResolver = async (testPlanVersion, _, context, info) => {
    const { transaction } = context;

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
            transaction
        });
    }

    return {
        id: testPlanVersion.directory,
        directory: testPlanVersion.directory,
        latestTestPlanVersion: latestTestPlanVersion.latestTestPlanVersion
    };
};

module.exports = testPlanResolver;
