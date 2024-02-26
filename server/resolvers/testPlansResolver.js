const {
    getTestPlans
} = require('../models/services.deprecated/TestPlanService');
const retrieveAttributes = require('./helpers/retrieveAttributes');
const {
    TEST_PLAN_VERSION_ATTRIBUTES,
    TEST_PLAN_ATTRIBUTES
} = require('../models/services.deprecated/helpers');

const testPlans = async (_, __, ___, info) => {
    const requestedFields =
        info.fieldNodes[0] &&
        info.fieldNodes[0].selectionSet.selections.map(
            selection => selection.name.value
        );
    const includeLatestTestPlanVersion = requestedFields.includes(
        'latestTestPlanVersion'
    );

    const { attributes: latestTestPlanVersionAttributes } = retrieveAttributes(
        'latestTestPlanVersion',
        TEST_PLAN_VERSION_ATTRIBUTES,
        info,
        true
    );

    const { attributes: testPlanVersionsAttributes } = retrieveAttributes(
        'testPlanVersions',
        TEST_PLAN_VERSION_ATTRIBUTES,
        info,
        true
    );

    const plans = await getTestPlans(
        {},
        includeLatestTestPlanVersion,
        TEST_PLAN_ATTRIBUTES,
        [
            ...new Set([
                ...latestTestPlanVersionAttributes,
                ...testPlanVersionsAttributes
            ])
        ],
        {
            order: [['testPlanVersions', 'updatedAt', 'DESC']]
        }
    );
    return plans.map(p => {
        return { ...p.dataValues };
    });
};

module.exports = testPlans;
