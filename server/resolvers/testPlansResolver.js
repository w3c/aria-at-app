const { getTestPlans } = require('../models/services/TestPlanVersionService');
const retrieveAttributes = require('./helpers/retrieveAttributes');
const { TEST_PLAN_VERSION_ATTRIBUTES } = require('../models/services/helpers');

const testPlans = async (_, __, ___, info) => {
    const requestedFields =
        info.fieldNodes[0] &&
        info.fieldNodes[0].selectionSet.selections.map(
            selection => selection.name.value
        );
    const includeLatest = requestedFields.includes('latestTestPlanVersion');
    const includeHistoric = requestedFields.includes('testPlanVersions');

    const { attributes: testPlanVersionAttributes } = retrieveAttributes(
        'latestTestPlanVersion',
        TEST_PLAN_VERSION_ATTRIBUTES,
        info,
        true
    );

    return getTestPlans({
        includeLatestTestPlanVersion: includeLatest,
        includeTestPlanVersions: includeHistoric,
        testPlanVersionOrder: [['updatedAt', 'desc']],
        testPlanVersionAttributes
    });
};

module.exports = testPlans;
