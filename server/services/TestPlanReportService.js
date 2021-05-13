const ModelService = require('./ModelService');
const {
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_ATTRIBUTES,
    TEST_PLAN_TARGET_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    USER_ATTRIBUTES
} = require('./helpers');
const { TestPlanReport, TestPlanRun } = require('../models');

// Section :- association helpers to be included with Models' results
const testPlanRunAssociation = (testPlanRunAttributes, userAttributes) => ({
    association: 'testPlanRuns',
    attributes: testPlanRunAttributes,
    // eslint-disable-next-line no-use-before-define
    include: [userAssociation(userAttributes)]
});

const testPlanAssociation = testPlanAttributes => ({
    association: 'testPlanObject', // resolver will have to remap this to 'testPlan' after the attributes have been successfully pulled; 'testPlan' conflicts on this model as the id
    attributes: testPlanAttributes
});

const testPlanTargetAssociation = testPlanTargetAttributes => ({
    association: 'testPlanTargetObject', // resolver will have to remap this to 'testPlanTarget' after the attributes have been successfully pulled; 'testPlanTarget' conflicts on this model as the id
    attributes: testPlanTargetAttributes
});

const userAssociation = userAttributes => ({
    association: 'testerObject', // resolver will have to remap this to 'tester' after the attributes have been successfully pulled; 'tester' conflicts on this model as the id
    attributes: userAttributes
});

/**
 * NB. Pass @param {roleAttributes} or @param {testPlanRunAttributes} as '[]' to exclude that related association
 * @param {number} id
 * @param {string[]} testPlanReportAttributes
 * @param {string[]} testPlanRunAttributes
 * @param {string[]} testPlanAttributes
 * @param {string[]} testPlanTargetAttributes
 * @param {string[]} userAttributes
 * @returns {Promise<void>}
 */
const getTestPlanReportById = async (
    id,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    return await ModelService.getById(
        TestPlanReport,
        id,
        testPlanReportAttributes,
        [
            testPlanRunAssociation(testPlanRunAttributes, userAttributes),
            testPlanAssociation(testPlanAttributes),
            testPlanTargetAssociation(testPlanTargetAttributes)
        ]
    );
};

/**
 * @param search
 * @param filter
 * @param testPlanReportAttributes
 * @param testPlanRunAttributes
 * @param testPlanAttributes
 * @param testPlanTargetAttributes
 * @param userAttributes
 * @param pagination
 * @returns {Promise<*>}
 */
const getTestPlanReports = async (
    search,
    filter = {},
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };

    return await ModelService.get(
        TestPlanReport,
        where,
        testPlanReportAttributes,
        [
            testPlanRunAssociation(testPlanRunAttributes, userAttributes),
            testPlanAssociation(testPlanAttributes),
            testPlanTargetAssociation(testPlanTargetAttributes)
        ],
        pagination
    );
};

/**
 * @param id
 * @param updateParams
 * @param testPlanReportAttributes
 * @param testPlanRunAttributes
 * @param testPlanAttributes
 * @param testPlanTargetAttributes
 * @param userAttributes
 * @returns {Promise<void>}
 */
const updateTestPlanReport = async (
    id,
    { publishStatus, coveragePercent, testPlanTarget, testPlan },
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    await ModelService.update(
        TestPlanReport,
        { id },
        { publishStatus, coveragePercent, testPlanTarget, testPlan }
    );

    return await ModelService.getById(
        TestPlanReport,
        id,
        testPlanReportAttributes,
        [
            testPlanRunAssociation(testPlanRunAttributes, userAttributes),
            testPlanAssociation(testPlanAttributes),
            testPlanTargetAssociation(testPlanTargetAttributes)
        ]
    );
};

// Section :- Custom Functions

/**
 * AssignTester
 * This assumes a TestPlanReport with testPlanReportId exists and a User with userId exists
 * @param testPlanReportId
 * @param userId
 * @param isManuallyTested
 * @param testPlanReportAttributes
 * @param testPlanRunAttributes
 * @param testPlanAttributes
 * @param testPlanTargetAttributes
 * @param userAttributes
 * @returns {Promise<*>}
 */
const assignTestPlanReportToUser = async (
    testPlanReportId,
    userId,
    isManuallyTested = false,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    // TestPlanRun has to be created for that user
    await ModelService.create(TestPlanRun, {
        testPlanReport: testPlanReportId,
        tester: userId,
        isManuallyTested
    });

    return await ModelService.get(
        TestPlanReport,
        {},
        testPlanReportAttributes,
        [
            testPlanRunAssociation(testPlanRunAttributes, userAttributes),
            testPlanAssociation(testPlanAttributes),
            testPlanTargetAssociation(testPlanTargetAttributes)
        ]
    );
};

/**
 * RemoveReportTester
 * This assumes a TestPlanReport with testPlanReportId exists and a User with userId exists
 * @param testPlanReportId
 * @param userId
 * @param testPlanReportAttributes
 * @param testPlanRunAttributes
 * @param testPlanAttributes
 * @param testPlanTargetAttributes
 * @param userAttributes
 * @returns {Promise<*>}
 */
const removeTestPlanReportForUser = async (
    testPlanReportId,
    userId,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    // TestPlanRun had have been created for that user
    await ModelService.removeByQuery(TestPlanRun, {
        testPlanReport: testPlanReportId,
        tester: userId
    });

    return await ModelService.get(
        TestPlanReport,
        {},
        testPlanReportAttributes,
        [
            testPlanRunAssociation(testPlanRunAttributes, userAttributes),
            testPlanAssociation(testPlanAttributes),
            testPlanTargetAssociation(testPlanTargetAttributes)
        ]
    );
};

/**
 *
 * @param testPlanReportId
 * @param publishStatus
 * @param testPlanReportAttributes
 * @param testPlanRunAttributes
 * @param testPlanAttributes
 * @param testPlanTargetAttributes
 * @param userAttributes
 * @returns {Promise<void>}
 */
const updateTestPlanReportStatus = async (
    testPlanReportId,
    publishStatus,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    return await updateTestPlanReport(
        testPlanReportId,
        { publishStatus },
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanAttributes,
        testPlanTargetAttributes,
        userAttributes
    );
};

module.exports = {
    // Basic CRUD
    getTestPlanReportById,
    getTestPlanReports,
    updateTestPlanReport,

    // Custom Functions : Test Queue Mutations
    assignTestPlanReportToUser,
    removeTestPlanReportForUser,
    updateTestPlanReportStatus,

    // Constants
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_ATTRIBUTES,
    TEST_PLAN_TARGET_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    USER_ATTRIBUTES
};
