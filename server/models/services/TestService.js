const ModelService = require('./ModelService');
const { TEST_ATTRIBUTES } = require('./helpers');
const { Sequelize, Test } = require('../');
const { Op } = Sequelize;

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {number} id - unique id of the TestPlanReport model being queried
 * @param {string[]} testAttributes - Test attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTestById = async (
    id,
    testAttributes = TEST_ATTRIBUTES,
    options = {}
) => {
    return await ModelService.getById(Test, id, testAttributes, null, options);
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} testAttributes - Test attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getTests = async (
    search,
    filter = {},
    testAttributes = TEST_ATTRIBUTES,
    pagination = {},
    options = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, title: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        Test,
        where,
        testAttributes,
        null,
        pagination,
        options
    );
};

/**
 * @param {object} createParams - values to be used to create the Test
 * @param {string[]} testAttributes - Test attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createTest = async (
    { test },
    testAttributes = TEST_ATTRIBUTES,
    options = {}
) => {
    const testResult = await ModelService.create(Test, {
        test
    });

    return await getTestById(testResult.id, testAttributes, options);
};

/**
 * @param {number} id - id of the Test record to be updated
 * @param {object} updateParams - values to be used to updated on the Test
 * @param {string[]} testAttributes - Test attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateTest = async (
    id,
    { test },
    testAttributes = TEST_ATTRIBUTES,
    options = {}
) => {
    await ModelService.update(
        Test,
        { id },
        {
            test
        },
        options
    );

    return await getTestById(id, testAttributes, options);
};

module.exports = {
    // Basic CRUD
    getTestById,
    getTests,
    createTest,
    updateTest
};
