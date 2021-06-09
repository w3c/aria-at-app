const ModelService = require('./ModelService');
const AtService = require('./AtService');
const BrowserService = require('./BrowserService');
const { TEST_PLAN_TARGET_ATTRIBUTES } = require('./helpers');
const { Sequelize, TestPlanTarget } = require('../');
const { Op } = Sequelize;

// Basic CRUD functions
/**
 * @param {number} id - id of TestPlanTarget to be retrieved
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestPlanTargetById = async (
    id,
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    options = {}
) => {
    return await ModelService.getById(
        TestPlanTarget,
        id,
        testPlanTargetAttributes,
        [],
        options
    );
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestPlanTargets = async (
    search,
    filter = {},
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    pagination = {},
    options = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, title: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        TestPlanTarget,
        where,
        testPlanTargetAttributes,
        [],
        pagination,
        options
    );
};

/**
 * @param {object} createParams - values to be used to create the TestPlanTarget record
 * @param {string[]} testPlanTargetAttributes - TestPlanTarget attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createTestPlanTarget = async (
    { title, atId, atVersion, browserId, browserVersion },
    testPlanTargetAttributes = TEST_PLAN_TARGET_ATTRIBUTES,
    options = {}
) => {
    const atResult = await AtService.getAtById(atId);
    const atName = atResult ? atResult.name : '';

    const browserResult = await BrowserService.getBrowserById(browserId);
    const browserName = browserResult ? browserResult.name : '';

    if (!title) {
        title = `${atName} ${atVersion} with ${browserName} ${browserVersion}`;
    }

    // fallback on SequelizeError for invalid at | atVersion | browser | browserVersion
    const testPlanTargetResult = await ModelService.create(
        TestPlanTarget,
        {
            title,
            atId,
            atVersion,
            browserId,
            browserVersion
        },
        options
    );
    const { id } = testPlanTargetResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await getTestPlanTargetById(id, testPlanTargetAttributes, options);
};

/**
 * @param {number} id - id of the TestPlanTarget record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeTestPlanTarget = async (id, deleteOptions) => {
    return await ModelService.removeById(TestPlanTarget, id, deleteOptions);
};

module.exports = {
    // Basic CRUD
    getTestPlanTargetById,
    getTestPlanTargets,
    createTestPlanTarget,
    removeTestPlanTarget
};
