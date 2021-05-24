const ModelService = require('./ModelService');
const {
    TEST_PLAN_ATTRIBUTES,
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_TARGET_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    TEST_RESULT_ATTRIBUTES,
    USER_ATTRIBUTES
} = require('./helpers');
const { TestPlan } = require('../');

const testPlanReportAssociation = (
    testPlanReportAttributes,
    testPlanTargetAttributes,
    testPlanRunAttributes,
    testResultAttributes,
    userAttributes
) => ({
    association: 'testPlanReports',
    attributes: testPlanReportAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        testPlanTargetAssociation(testPlanTargetAttributes),
        // eslint-disable-next-line no-use-before-define
        testPlanRunAssociation(
            testPlanRunAttributes,
            testResultAttributes,
            userAttributes
        )
    ]
});

const testPlanTargetAssociation = testPlanTargetAttributes => ({
    association: 'testPlanTargetObject', // resolver will have to remap this to 'testPlanTarget' after the attributes have been successfully pulled; 'testPlanTarget' conflicts on this model as the id
    attributes: testPlanTargetAttributes
});

const testPlanRunAssociation = (
    testPlanRunAttributes,
    testResultAttributes,
    userAttributes
) => ({
    association: 'testPlanRuns',
    attributes: testPlanRunAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        testResultAssociation(testResultAttributes),
        // eslint-disable-next-line no-use-before-define
        userAssociation(userAttributes)
    ]
});

/**
 * @param {string[]} testResultAttributes - TestResult attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testResultAssociation = testResultAttributes => ({
    association: 'testResults',
    attributes: testResultAttributes
});

const userAssociation = userAttributes => ({
    association: 'testerObject', // resolver will have to remap this to 'tester' after the attributes have been successfully pulled; 'tester' conflicts on this model as the id
    attributes: userAttributes
});

const getTestPlanById = async (
    id,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    return await ModelService.getById(TestPlan, id, testPlanAttributes, [
        testPlanReportAssociation(
            testPlanReportAttributes,
            testPlanTargetAttributes,
            testPlanRunAttributes,
            testResultAttributes,
            userAttributes
        )
    ]);
};

module.exports = {
    getTestPlanById
};
