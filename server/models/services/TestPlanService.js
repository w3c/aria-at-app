const ModelService = require('./ModelService');
const {
    TEST_PLAN_ATTRIBUTES,
    TEST_PLAN_REPORT_ATTRIBUTES
} = require('./helpers');
const { TestPlan } = require('../');

const testPlanReportAssociation = testPlanReportAttributes => ({
    association: 'testPlanReports',
    attributes: testPlanReportAttributes
});

const getTestPlanById = async (
    id,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES
) => {
    return await ModelService.getById(TestPlan, id, testPlanAttributes, [
        testPlanReportAssociation(testPlanReportAttributes)
    ]);
};

module.exports = {
    getTestPlanById
};
