const ModelService = require('./ModelService');
const {
    TEST_PLAN_ATTRIBUTES,
    TEST_PLAN_VERSION_ATTRIBUTES,
    TEST_PLAN_REPORT_ATTRIBUTES
} = require('./helpers');
const { TestPlan } = require('../');

const getTestPlans = async (
    filter = {},
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    pagination = {},
    options = {}
) => {
    // search and filtering options
    let where = { ...filter };

    return ModelService.get(
        TestPlan,
        where,
        testPlanAttributes,
        [
            {
                association: 'testPlanVersions',
                attributes: TEST_PLAN_VERSION_ATTRIBUTES
            },
            {
                association: 'testPlanReports',
                attributes: TEST_PLAN_REPORT_ATTRIBUTES
            }
        ],
        pagination,
        options
    );
};

const createTestPlan = async ({ title, directory }) => {
    const testPlan = await ModelService.create(TestPlan, {
        title,
        directory
    });

    const newTestPlan = await getTestPlans({ id: testPlan.dataValues.id });
    return newTestPlan[0];
};

module.exports = {
    getTestPlans,
    createTestPlan
};
