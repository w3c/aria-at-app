const ModelService = require('./ModelService');
const {
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_VERSION_ATTRIBUTES,
    TEST_PLAN_TARGET_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    USER_ATTRIBUTES
} = require('./helpers');
const { TestPlanReport } = require('../');
const { getAtVersion, createAtVersion } = require('./AtService');
const { getBrowserVersion, createBrowserVersion } = require('./BrowserService');
const {
    getTestPlanTarget,
    createTestPlanTarget
} = require('./TestPlanTargetService');

// association helpers to be included with Models' results

/**
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes
 * @param {string[]} userAttributes - User attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanRunAssociation = (testPlanRunAttributes, userAttributes) => ({
    association: 'testPlanRuns',
    attributes: testPlanRunAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        userAssociation(userAttributes)
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
    association: 'tester',
    attributes: userAttributes
});

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {number} id - unique id of the TestPlanReport model being queried
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @returns {Promise<*>}
 */
const getTestPlanReportById = async (
    id,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    return await ModelService.getById(
        TestPlanReport,
        id,
        testPlanReportAttributes,
        [
            testPlanRunAssociation(testPlanRunAttributes, userAttributes),
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
            testPlanVersionAssociation(testPlanVersionAttributes),
            testPlanTargetAssociation(testPlanTargetAttributes)
        ],
        pagination
    );
};

const createTestPlanReport = async () => {
    throw new Error('not implemented');
};

/**
 * @param {number} id - unique id of the TestPlanReport model being to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @returns {Promise<*>}
 */
const updateTestPlanReport = async (
    id,
    { status, testPlanTargetId, testPlanVersionId },
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    await ModelService.update(
        TestPlanReport,
        { id },
        { status, testPlanTargetId, testPlanVersionId }
    );

    // call custom this.getById if custom attributes are being accounted for
    return await getTestPlanReportById(
        id,
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanVersionAttributes,
        testPlanTargetAttributes,
        userAttributes
    );
};

const getOrCreateTestPlanReport = async (
    {
        testPlanVersionId,
        testPlanTarget: { atId, atVersion, browserId, browserVersion }
    },
    { status } = {},
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    pagination = {}
) => {
    const accumulatedResults = ModelService.nestedGetOrCreate([
        {
            get: getAtVersion,
            create: createAtVersion,
            values: { atId, version: atVersion },
            returnAttributes: [null]
        },
        {
            get: getBrowserVersion,
            create: createBrowserVersion,
            values: { browserId, version: browserVersion },
            returnAttributes: [null]
        },
        {
            get: getTestPlanTarget,
            create: createTestPlanTarget,
            values: { atId, browserId, atVersion, browserVersion },
            returnAttributes: [null]
        },
        accumulatedResults => {
            const [testPlanTarget] = accumulatedResults[2];
            return {
                get: getTestPlanTarget,
                create: createTestPlanReport,
                update: updateTestPlanReport,
                values: {
                    testPlanTargetId: testPlanTarget.id,
                    testPlanVersionId: testPlanVersionId
                },
                updateValues: { status },
                returnAttributes: [null, [], [], [], []]
            };
        }
    ]);

    const created = [];
    accumulatedResults.forEach(([record, isNew]) => {
        if (isNew) created.push(record);
    });

    const testPlanReportId = accumulatedResults[3][0].id;

    const testPlanReport = await getTestPlanReportById(
        testPlanReportId,
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanVersionAttributes,
        testPlanTargetAttributes,
        userAttributes,
        pagination
    );

    return [testPlanReport, created];
};

module.exports = {
    // Basic CRUD
    getTestPlanReportById,
    getTestPlanReports,
    updateTestPlanReport,
    getOrCreateTestPlanReport
};
