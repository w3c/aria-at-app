const ModelService = require('./ModelService');
const {
    TEST_PLAN_REPORT_ATTRIBUTES,
    TEST_PLAN_VERSION_ATTRIBUTES,
    TEST_PLAN_TARGET_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    AT_ATTRIBUTES,
    BROWSER_ATTRIBUTES,
    USER_ATTRIBUTES
} = require('./helpers');
const { TestPlanReport } = require('../');
const { getAtVersions, createAtVersion } = require('./AtService');
const {
    getBrowserVersions,
    createBrowserVersion
} = require('./BrowserService');
const {
    getTestPlanTargets,
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
const testPlanTargetAssociation = (
    testPlanTargetAttributes,
    atAttributes,
    browserAttributes
) => ({
    association: 'testPlanTarget',
    attributes: testPlanTargetAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        atAssociation(atAttributes),
        // eslint-disable-next-line no-use-before-define
        browserAssociation(browserAttributes)
    ]
});

/**
 * @param {string[]} atAttributes - User attributes
 * @returns {{association: string, attributes: string[]}}
 */
const atAssociation = atAttributes => ({
    association: 'at',
    attributes: atAttributes
});

/**
 * @param {string[]} browserAttributes - User attributes
 * @returns {{association: string, attributes: string[]}}
 */
const browserAssociation = browserAttributes => ({
    association: 'browser',
    attributes: browserAttributes
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
 * @param {string[]} testPlanReportAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} atAttributes - At attributes to be returned in the result
 * @param {string[]} browserAttributes - Browser attributes to be returned in the results
 * @param {string[]} userAttributes - User attributes to be returned in the results
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestPlanReportById = async (
    id,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    options = {}
) => {
    return await ModelService.getById(
        TestPlanReport,
        id,
        testPlanReportAttributes,
        [
            testPlanRunAssociation(testPlanRunAttributes, userAttributes),
            testPlanVersionAssociation(testPlanVersionAttributes),
            testPlanTargetAssociation(
                testPlanTargetAttributes,
                atAttributes,
                browserAttributes
            )
        ],
        options
    );
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} testPlanReportAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} atAttributes - At attributes to be returned in the result
 * @param {string[]} browserAttributes - Browser attributes to be returned in the results
 * @param {string[]} userAttributes - User attributes to be returned in the results
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestPlanReports = async (
    search,
    filter = {},
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    pagination = {},
    options = {}
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
            testPlanTargetAssociation(
                testPlanTargetAttributes,
                atAttributes,
                browserAttributes
            )
        ],
        pagination,
        options
    );
};

/**
 * @param {object} createParams - values to be used to create the TestPlanReport
 * @param {string[]} testPlanReportAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} atAttributes - At attributes to be returned in the result
 * @param {string[]} browserAttributes - Browser attributes to be returned in the results
 * @param {string[]} userAttributes - User attributes to be returned in the results
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createTestPlanReport = async (
    { status, testPlanTargetId, testPlanVersionId },
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    options
) => {
    const testPlanReportResult = await ModelService.create(
        TestPlanReport,
        { status, testPlanTargetId, testPlanVersionId },
        options
    );

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getById(
        TestPlanReport,
        testPlanReportResult.id,
        testPlanReportAttributes,
        [
            testPlanRunAssociation(testPlanRunAttributes, userAttributes),
            testPlanVersionAssociation(testPlanVersionAttributes),
            testPlanTargetAssociation(
                testPlanTargetAttributes,
                atAttributes,
                browserAttributes
            )
        ],
        options
    );
};

/**
 * @param {number} id - unique id of the TestPlanReport model being to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {string[]} atAttributes - At attributes to be returned in the result
 * @param {string[]} browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateTestPlanReport = async (
    id,
    { status, testPlanTargetId, testPlanVersionId },
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    options = {}
) => {
    await ModelService.update(
        TestPlanReport,
        { id },
        { status, testPlanTargetId, testPlanVersionId },
        options
    );

    // call custom this.getById if custom attributes are being accounted for
    return await getTestPlanReportById(
        id,
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanVersionAttributes,
        testPlanTargetAttributes,
        atAttributes,
        browserAttributes,
        userAttributes
    );
};

/**
 * Gets one TestPlanReport, or creates it if it doesn't exist, and then optionally updates it.
 * @param {*} nestedGetOrCreateValues - These values will be used to find a matching record, or they will be used to create one
 * @param {*} nestedUpdateValues - Values which will be used when a record is found or created, but not used for the initial find
 * @param {*} testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {*} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {*} testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {*} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {*} atAttributes - At attributes to be returned in the result
 * @param {*} browserAttributes - Browser attributes to be returned in the result
 * @param {*} userAttributes - User attributes to be returned in the result
 * @returns {Promise<[*, [*]]}
 */
const getOrCreateTestPlanReport = async (
    {
        testPlanVersionId,
        testPlanTarget: {
            atId,
            atVersion: providedAtVersion,
            browserId,
            browserVersion: providedBrowserVersion
        }
    },
    { status } = {},
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    const accumulatedResults = await ModelService.nestedGetOrCreate([
        {
            get: getAtVersions,
            create: createAtVersion,
            values: { atId, atVersion: providedAtVersion },
            returnAttributes: [null, []]
        },
        {
            get: getBrowserVersions,
            create: createBrowserVersion,
            values: { browserId, browserVersion: providedBrowserVersion },
            returnAttributes: [null, []]
        },
        {
            get: getTestPlanTargets,
            create: createTestPlanTarget,
            values: {
                atId,
                browserId,
                atVersion: providedAtVersion,
                browserVersion: providedBrowserVersion
            },
            returnAttributes: [null]
        },
        accumulatedResults => {
            const [testPlanTarget] = accumulatedResults[2];
            return {
                get: getTestPlanReports,
                create: createTestPlanReport,
                update: updateTestPlanReport,
                values: {
                    testPlanTargetId: testPlanTarget.id,
                    testPlanVersionId: testPlanVersionId
                },
                updateValues: { status },
                returnAttributes: [null, [], [], [], [], [], []]
            };
        }
    ]);

    const testPlanTargetId = accumulatedResults[2][0].id;
    const testPlanReportId = accumulatedResults[3][0].id;
    const atVersion = accumulatedResults[0][0].atVersion;
    const browserVersion = accumulatedResults[1][0].browserVersion;

    const created = [];
    if (accumulatedResults[0][1]) {
        created.push({ testPlanReportId, testPlanTargetId, atVersion });
    }
    if (accumulatedResults[1][1]) {
        created.push({ testPlanReportId, testPlanTargetId, browserVersion });
    }
    if (accumulatedResults[2][1]) {
        created.push({ testPlanReportId, testPlanTargetId });
    }
    if (accumulatedResults[3][1]) {
        created.push({ testPlanReportId });
    }

    const testPlanReport = await getTestPlanReportById(
        testPlanReportId,
        testPlanReportAttributes,
        testPlanRunAttributes,
        testPlanVersionAttributes,
        testPlanTargetAttributes,
        atAttributes,
        browserAttributes,
        userAttributes
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
