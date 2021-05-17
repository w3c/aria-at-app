const ModelService = require('./ModelService');
const {
    TEST_PLAN_RUN_ATTRIBUTES,
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_RESULT_ATTRIBUTES,
    USER_ATTRIBUTES
} = require('./helpers');
const { TestPlanRun } = require('../index');

// Section :- association helpers to be included with Models' results
const testPlanReportAssociation = testPlanReportAttributes => ({
    association: 'testPlanReport',
    attributes: testPlanReportAttributes
});

const testResultAssociation = testResultAttributes => ({
    association: 'testResults',
    attributes: testResultAttributes
});

const userAssociation = userAttributes => ({
    association: 'testerObject', // resolver will have to remap this to 'tester' after the attributes have been successfully pulled; 'tester' conflicts on this model as the id
    attributes: userAttributes
});

// TestPlanRun
const getTestPlanRunById = async (
    id,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    return ModelService.getById(TestPlanRun, id, testPlanRunAttributes, [
        testPlanReportAssociation(testPlanReportAttributes),
        testResultAssociation(testResultAttributes),
        userAssociation(userAttributes)
    ]);
};

const getTestPlanRuns = async (
    search,
    filter = {},
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };

    return ModelService.get(
        TestPlanRun,
        where,
        testPlanRunAttributes,
        [
            testPlanReportAssociation(testPlanReportAttributes),
            testResultAssociation(testResultAttributes),
            userAssociation(userAttributes)
        ],
        pagination
    );
};

const createTestPlanRun = async (
    { isManuallyTested, tester, testPlanReport },
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    const testPlanRunResult = await ModelService.create(TestPlanRun, {
        isManuallyTested,
        tester,
        testPlanReport
    });
    const { id } = testPlanRunResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getById(TestPlanRun, id, testPlanRunAttributes, [
        testPlanReportAssociation(testPlanReportAttributes),
        testResultAssociation(testResultAttributes),
        userAssociation(userAttributes)
    ]);
};

const updateTestPlanRun = async (
    id,
    { isManuallyTested, tester },
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    await ModelService.update(
        TestPlanRun,
        { id },
        { isManuallyTested, tester }
    );

    return await ModelService.getById(TestPlanRun, id, testPlanRunAttributes, [
        testPlanReportAssociation(testPlanReportAttributes),
        testResultAssociation(testResultAttributes),
        userAssociation(userAttributes)
    ]);
};

const removeTestPlanRun = async (id, deleteOptions = { truncate: false }) => {
    return await ModelService.removeById(TestPlanRun, id, deleteOptions);
};

module.exports = {
    // TestPlanRun
    getTestPlanRunById,
    getTestPlanRuns,
    createTestPlanRun,
    updateTestPlanRun,
    removeTestPlanRun,

    // Constants
    TEST_PLAN_RUN_ATTRIBUTES,
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_RESULT_ATTRIBUTES,
    USER_ATTRIBUTES
};
