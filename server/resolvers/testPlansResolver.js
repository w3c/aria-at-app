const {
    getTestPlans
} = require('../models/services.deprecated/TestPlanService');
const retrieveAttributes = require('./helpers/retrieveAttributes');
const { TEST_PLAN_VERSION_ATTRIBUTES } = require('../models/services/helpers');

const testPlans = async (_, __, context, info) => {
    const { transaction } = context;

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

    const combinedTestPlanVersionAttributes = [
        ...new Set([
            ...latestTestPlanVersionAttributes,
            ...testPlanVersionsAttributes
        ])
    ];

    const hasAssociations = combinedTestPlanVersionAttributes.length !== 0;

    const plans = await getTestPlans({
        includeLatestTestPlanVersion,
        testPlanVersionAttributes: combinedTestPlanVersionAttributes,
        testPlanReportAttributes: hasAssociations ? null : [],
        atAttributes: hasAssociations ? null : [],
        browserAttributes: hasAssociations ? null : [],
        testPlanRunAttributes: hasAssociations ? null : [],
        userAttributes: hasAssociations ? null : [],
        pagination: { order: [['testPlanVersions', 'updatedAt', 'DESC']] },
        transaction
    });
    return plans.map(p => {
        return { ...p.dataValues };
    });
};

module.exports = testPlans;
