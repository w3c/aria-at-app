const { getTestPlans } = require('../models/services/TestPlanService');
const retrieveAttributes = require('./helpers/retrieveAttributes');
const { TEST_PLAN_VERSION_ATTRIBUTES } = require('../models/services/helpers');

const testPlans = async (_, __, context, info) => {
    const { t } = context;

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

    const plans = await getTestPlans({
        includeLatestTestPlanVersion,
        testPlanVersionAttributes: [
            ...new Set([
                ...latestTestPlanVersionAttributes,
                ...testPlanVersionsAttributes
            ])
        ],
        pagination: { order: [['testPlanVersions', 'updatedAt', 'DESC']] },
        t
    });
    return plans.map(p => {
        return { ...p.dataValues };
    });
};

module.exports = testPlans;
