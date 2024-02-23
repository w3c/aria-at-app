const ModelService = require('./ModelService');
const {
    TEST_PLAN_ATTRIBUTES,
    TEST_PLAN_VERSION_ATTRIBUTES,
    TEST_PLAN_REPORT_ATTRIBUTES,
    AT_ATTRIBUTES,
    BROWSER_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES,
    USER_ATTRIBUTES
} = require('./helpers');
const { Sequelize, TestPlan } = require('../');
const { Op } = Sequelize;

// association helpers to be included with Models' results

/**
 * @param {string[]} testPlanVersionAttributes - TestPlanVersion attributes
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes
 * @param {string[]} atAttributes - AT attributes
 * @param {string[]} browserAttributes - Browser attributes
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes
 * @param {string[]} userAttributes - User attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanVersionAssociation = (
    testPlanVersionAttributes,
    testPlanReportAttributes,
    atAttributes,
    browserAttributes,
    testPlanRunAttributes,
    userAttributes
) => ({
    association: 'testPlanVersions',
    attributes: testPlanVersionAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        testPlanReportAssociation(
            testPlanReportAttributes,
            atAttributes,
            browserAttributes,
            testPlanRunAttributes,
            userAttributes
        )
    ]
});

/**
 * @param {string[]} testPlanReportAttributes - TestPlanReport attributes
 * @param {string[]} atAttributes - AT attributes
 * @param {string[]} browserAttributes - Browser attributes
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes
 * @param {string[]} userAttributes - User attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanReportAssociation = (
    testPlanReportAttributes,
    atAttributes,
    browserAttributes,
    testPlanRunAttributes,
    userAttributes
) => ({
    association: 'testPlanReports',
    attributes: testPlanReportAttributes,
    include: [
        // eslint-disable-next-line no-use-before-define
        atAssociation(atAttributes),
        // eslint-disable-next-line no-use-before-define
        browserAssociation(browserAttributes),
        // eslint-disable-next-line no-use-before-define
        testPlanRunAssociation(testPlanRunAttributes, userAttributes)
    ]
});

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
 * @param {string[]} atAttributes - AT attributes
 * @returns {{association: string, attributes: string[]}}
 */
const atAssociation = atAttributes => ({
    association: 'at',
    attributes: atAttributes
});

/**
 * @param {string[]} browserAttributes - Browser attributes
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
 * @param {object} options
 * @param {number} options.id - id of TestPlan to be retrieved
 * @param {string[]} options.testPlanAttributes - TestPlan attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestPlanById = async ({
    id,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    transaction
}) => {
    return ModelService.getById(TestPlan, {
        id,
        attributes: testPlanAttributes,
        include: [
            testPlanVersionAssociation(
                testPlanVersionAttributes,
                testPlanReportAttributes,
                atAttributes,
                browserAttributes,
                testPlanRunAttributes,
                userAttributes
            )
        ],
        transaction
    });
};

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} options
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {boolean} options.includeLatestTestPlanVersion - whether to add a latestTestPlanVersion field to the results
 * @param {string[]} options.testPlanAttributes - TestPlan attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} options.pagination.limit - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} options.pagination.order- expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestPlans = async ({
    search,
    where = {},
    includeLatestTestPlanVersion,
    testPlanAttributes = TEST_PLAN_ATTRIBUTES,
    testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
    testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    pagination = {},
    transaction
}) => {
    // search and filtering options
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, title: { [Op.iLike]: searchQuery } };

    const data = await ModelService.get(TestPlan, {
        where,
        attributes: testPlanAttributes,
        include: [
            testPlanVersionAssociation(
                testPlanVersionAttributes,
                testPlanReportAttributes,
                atAttributes,
                browserAttributes,
                testPlanRunAttributes,
                userAttributes
            )
        ],
        pagination,
        transaction
    });

    if (includeLatestTestPlanVersion) {
        return data.map(d => {
            const latestTestPlanVersion = d.dataValues.testPlanVersions[0];
            return {
                ...d,
                dataValues: {
                    ...d.dataValues,
                    latestTestPlanVersion
                }
            };
        });
    }

    return data;
};

/**
 * @param {object} options
 * @param {object} options.values - values to be used to create the TestPlanVersion
 * @param {string[]} options.testPlanAttributes - TestPlan attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createTestPlan = async ({
    values: { title, directory },
    testPlanAttributes,
    testPlanVersionAttributes,
    testPlanReportAttributes,
    atAttributes,
    browserAttributes,
    testPlanRunAttributes,
    userAttributes,
    transaction
}) => {
    const testPlan = await ModelService.create(TestPlan, {
        values: {
            title,
            directory
        },
        transaction
    });

    return getTestPlanById({
        id: testPlan.id,
        testPlanAttributes,
        testPlanVersionAttributes,
        testPlanReportAttributes,
        atAttributes,
        browserAttributes,
        testPlanRunAttributes,
        userAttributes,
        transaction
    });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the TestPlan record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} options.testPlanAttributes - TestPlan attributes to be returned in the result
 * @param {string[]} options.testPlanVersionAttributes - TestPlanVersion attributes to be returned in the result
 * @param {string[]} options.testPlanReportAttributes - TestPlanReport attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.browserAttributes - Browser attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateTestPlanById = async ({
    id,
    values: { title },
    testPlanAttributes,
    testPlanVersionAttributes,
    testPlanReportAttributes,
    atAttributes,
    browserAttributes,
    testPlanRunAttributes,
    userAttributes,
    transaction
}) => {
    await ModelService.update(TestPlan, {
        where: { id },
        values: { title },
        transaction
    });

    return getTestPlanById({
        id,
        testPlanAttributes,
        testPlanVersionAttributes,
        testPlanReportAttributes,
        atAttributes,
        browserAttributes,
        testPlanRunAttributes,
        userAttributes,
        transaction
    });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the TestPlan record to be removed
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeTestPlanById = async ({ id, truncate = false, transaction }) => {
    return ModelService.removeById(TestPlan, { id, truncate, transaction });
};

module.exports = {
    getTestPlanById,
    getTestPlans,
    createTestPlan,
    updateTestPlanById,
    removeTestPlanById
};
