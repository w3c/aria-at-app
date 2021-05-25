const ModelService = require('./ModelService');
const TestPlanRunService = require('./TestPlanRunService');
const {
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_VERSION_ATTRIBUTES,
    TEST_PLAN_TARGET_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    USER_ATTRIBUTES,
    TEST_RESULT_ATTRIBUTES
} = require('./helpers');
const { TestPlanReport, TestPlanRun } = require('../');

// association helpers to be included with Models' results

/**
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes
 * @param {string[]} userAttributes - User attributes
 * @param {string[]} testResultAttributes - TestResult attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanRunAssociation = (
    testPlanRunAttributes,
    userAttributes,
    testResultAttributes
) => ({
    association: 'testPlanRuns',
    attributes: testPlanRunAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        userAssociation(userAttributes),
        // eslint-disable-next-line no-use-before-define
        testResultAssociation(testResultAttributes)
    ]
});

/**
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanVersionAssociation = testPlanVersionAttributes => ({
    association: 'testPlanVersion',
    attributes: testPlanVersionAttributes
});

/**
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanTargetAssociation = testPlanTargetAttributes => ({
    association: 'testPlanTarget',
    attributes: testPlanTargetAttributes
});

/**
 * @param {string[]} userAttributes - User attributes
 * @returns {{association: string, attributes: string[]}}
 */
const userAssociation = userAttributes => ({
    association: 'testerObject', // resolver will have to remap this to 'tester' after the attributes have been successfully pulled; 'tester' conflicts on this model as the id
    attributes: userAttributes
});

/**
 * @param {string[]} testResultAttributes - TestResult attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testResultAssociation = testResultAttributes => ({
    association: 'testResults',
    attributes: testResultAttributes
});

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {number} id - unique id of the TestPlanReport model being queried
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {string[]} testResultAttributes - TestResult attributes to be returned in the result
 * @returns {Promise<*>}
 */
const getTestPlanReportById = async (
    id,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES
) => {
    return await ModelService.getById(
        TestPlanReport,
        id,
        testPlanReportAttributes,
        [
            testPlanRunAssociation(
                testPlanRunAttributes,
                userAttributes,
                testResultAttributes
            ),
            testPlanVersionAssociation(testPlanVersionAttributes),
            testPlanTargetAssociation(testPlanTargetAttributes)
        ]
    );
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {string[]} testResultAttributes - TestResult attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @returns {Promise<*>}
 */
const getTestPlanReports = async (
    search,
    filter = {},
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };

    return await ModelService.get(
        TestPlanReport,
        where,
        testPlanReportAttributes,
        [
            testPlanRunAssociation(
                testPlanRunAttributes,
                userAttributes,
                testResultAttributes
            ),
            testPlanVersionAssociation(testPlanVersionAttributes),
            testPlanTargetAssociation(testPlanTargetAttributes)
        ],
        pagination
    );
};

/**
 * @param {number} id - unique id of the TestPlanReport model being to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {string[]} testResultAttributes - TestResult attributes to be returned in the result
 * @returns {Promise<*>}
 */
const updateTestPlanReport = async (
    id,
    { publishStatus, coveragePercent, testPlanTargetId, testPlanVersionId },
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES
) => {
    await ModelService.update(
        TestPlanReport,
        { id },
        { publishStatus, coveragePercent, testPlanTargetId, testPlanVersionId }
    );

    // call custom this.getById if custom attributes are being accounted for
    return await getTestPlanReportById(
        id,
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanVersionAttributes,
        testPlanTargetAttributes,
        userAttributes,
        testResultAttributes
    );
};

// Custom Functions

/**
 * AssignTester
 * This assumes a TestPlanReport with testPlanReportId exists and a User with userId exists
 * @param {number} testPlanReportId - TestPlanReport id of the testPlan being assigned
 * @param {number} userId - User id of the user being assigned a TestPlan
 * @param {boolean} isManuallyTested - indicates whether this test is being executed manually or not
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {string[]} testResultAttributes - TestResult attributes to be returned in the result
 * @returns {Promise<*>}
 */
const assignTestPlanReportToUser = async (
    testPlanReportId,
    userId,
    isManuallyTested = false,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES
) => {
    // TestPlanRun has to be created for that user
    await TestPlanRunService.createTestPlanRun({
        testPlanReport: testPlanReportId,
        tester: userId,
        isManuallyTested
    });

    return await getTestPlanReportById(
        testPlanReportId,
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanVersionAttributes,
        testPlanTargetAttributes,
        userAttributes,
        testResultAttributes
    );
};

/**
 * RemoveReportTester
 * This assumes a TestPlanReport with testPlanReportId exists and a User with userId exists
 * @param {number} testPlanReportId - TestPlanReport id that the tester is being removed from
 * @param {number} userId - unique id of the tester user being removed
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {string[]} testResultAttributes - TestResult attributes to be returned in the result
 * @returns {Promise<*>}
 */
const removeTestPlanReportForUser = async (
    testPlanReportId,
    userId,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES
) => {
    // TestPlanRun had have been created for that user
    await ModelService.removeByQuery(TestPlanRun, {
        testPlanReport: testPlanReportId,
        tester: userId
    });

    return await getTestPlanReportById(
        testPlanReportId,
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanVersionAttributes,
        testPlanTargetAttributes,
        userAttributes,
        testResultAttributes
    );
};

/**
 * Custom function to update the TestPlanReportStatus; potentially made redundant due to {@method updateTestPlanReport}
 * @param {number} testPlanReportId - TestPlanReport id of the TestPlanReport being updated
 * @param {string} publishStatus - must be one of: 'draft', 'in_review' or 'final'
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {string[]} testResultAttributes - TestResult attributes to be returned in the result
 * @returns {Promise<*>}
 */
const updateTestPlanReportStatus = async (
    testPlanReportId,
    publishStatus,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    testResultAttributes = TEST_RESULT_ATTRIBUTES
) => {
    return await updateTestPlanReport(
        testPlanReportId,
        { publishStatus },
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanVersionAttributes,
        testPlanTargetAttributes,
        userAttributes,
        testResultAttributes
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
    updateTestPlanReportStatus
};
