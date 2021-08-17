const { getTestPlans } = require('../models/services/TestPlanVersionService');

const testPlans = async (_, __, ___, info) => {
    const requestedFields =
        info.fieldNodes[0] &&
        info.fieldNodes[0].selectionSet.selections.map(
            selection => selection.name.value
        );
    const includeLatest = requestedFields.includes('latestTestPlanVersion');
    const includeHistoric = requestedFields.includes('testPlanVersions');

    return getTestPlans({
        includeLatestTestPlanVersion: includeLatest,
        includeTestPlanVersions: includeHistoric
    });
};

module.exports = testPlans;
