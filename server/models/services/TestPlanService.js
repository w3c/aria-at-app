const ModelService = require('./ModelService');
const {
    TEST_PLAN_ATTRIBUTES,
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_TARGET_ATTRIBUTES
} = require('./helpers');
const { TestPlan } = require('../');

const testPlanReportAssociation = (
    testPlanReportAttributes,
    testPlanTargetAttributes
) => ({
    association: 'testPlanReports',
    attributes: testPlanReportAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        testPlanTargetAssociation(testPlanTargetAttributes)
    ]
});

const testPlanTargetAssociation = testPlanTargetAttributes => ({
    association: 'testPlanTargetObject', // resolver will have to remap this to 'testPlanTarget' after the attributes have been successfully pulled; 'testPlanTarget' conflicts on this model as the id
    attributes: testPlanTargetAttributes
});

const getTestPlanById = async (
    id,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES
) => {
    return await ModelService.getById(TestPlan, id, testPlanAttributes, [
        testPlanReportAssociation(
            testPlanReportAttributes,
            testPlanTargetAttributes
        )
    ]);
};

module.exports = {
    getTestPlanById
};
