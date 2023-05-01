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

    const data = await ModelService.get(
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

    return data.map(d => {
        const latestTestPlanVersion = d.dataValues.testPlanVersions.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        )[0];
        return {
            ...d,
            dataValues: {
                ...d.dataValues,
                latestTestPlanVersion
            }
        };
    });
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
