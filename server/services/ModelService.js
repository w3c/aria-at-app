const { sequelize } = require('../models');

/**
 * @param model
 * @param id
 * @param attributes
 * @param include
 * @returns {Promise<*>}
 */
const getById = async (model, id, attributes = [], include = []) => {
    if (!model) throw new Error('Model not defined'); // TODO: pass through custom APIError

    // findByPk
    return await model.findOne({
        where: { id },
        attributes,
        include
    });
};

/**
 * @param model
 * @param queryParams
 * @param attributes
 * @param include
 * @returns {Promise<*>}
 */
const getByQuery = async (
    model,
    queryParams,
    attributes = [],
    include = []
) => {
    if (!model) throw new Error('Model not defined'); // TODO: pass through custom APIError

    return await model.findOne({
        where: { ...queryParams },
        attributes,
        include
    });
};

/**
 * @link {https://sequelize.org/v5/manual/models-usage.html#-code-findandcountall--code----search-for-multiple-elements-in-the-database--returns-both-data-and-total-count}
 * @param model
 * @param filter
 * @param attributes
 * @param include
 * @param {object} pagination
 * @param {number} [pagination.page=0]
 * @param {number} [pagination.limit=10]
 * @param {string[]} [pagination.order=[]]
 * @param {boolean} [pagination.enable=false]
 * @returns {Promise<*>}
 */
const get = async (
    model,
    filter = {}, // pass to 'where' for top level model
    attributes = [],
    include = [],
    pagination = {}
) => {
    if (!model) throw new Error('Model not defined'); // TODO: pass through custom APIError

    // search and filtering options
    let where = { ...filter };

    // pagination and sorting options
    let { page = 0, limit = 10, order = [], enable = false } = pagination; // page 0->1, 1->2; manage through middleware
    // 'order' structure eg. [ [ 'username', 'DESC' ], [..., ...], ... ]
    if (page < 0) page = 0;
    if (limit < 0 || !enable) limit = null;
    const offset = limit < 0 ? 0 : page * limit; // skip (1 * 10 results) = 10 to get get to page 2

    const queryOptions = {
        where,
        order,
        attributes,
        include // included fields being marked as 'required' will affect overall count for pagination
    };

    if (enable) {
        // enable paginated result structure and related values
        const result = await model.findAndCountAll({
            ...queryOptions,
            limit,
            offset
        });

        const { count: totalResultsCount, rows: data } = result;
        const resultsCount = data.length || 0;
        const pagesCount = Math.ceil(totalResultsCount / limit) || 1;

        return {
            page: page + 1,
            pageSize: limit,
            resultsCount,
            totalResultsCount,
            pagesCount,
            data
        };
    }
    return await model.findAll({ ...queryOptions });
};

/**
 * @param model
 * @param createParams
 * @returns {Promise<*>}
 */
const create = async (model, createParams) => {
    if (!model) throw new Error('Model not defined'); // TODO: pass through custom APIError
    return await model.create({ ...createParams });
};

/**
 * @param model
 * @param queryParams
 * @param updateParams
 * @returns {Promise<*>}
 */
const update = async (model, queryParams, updateParams) => {
    if (!model) throw new Error('Model not defined'); // TODO: pass through custom APIError

    return await model.update(
        { ...updateParams },
        { where: { ...queryParams } }
    );
};

/**
 * @param model
 * @param id
 * @param deleteOptions
 * @returns {Promise<boolean>}
 */
const removeById = async (model, id, deleteOptions = { truncate: false }) => {
    if (!model) throw new Error('Model not defined'); // TODO: pass through custom APIError

    const { truncate } = deleteOptions;
    await model.destroy({
        where: { id },
        truncate
    });
    return true;
};

/**
 * @param model
 * @param queryParams
 * @param deleteOptions
 * @returns {Promise<boolean>}
 */
const removeByQuery = async (
    model,
    queryParams,
    deleteOptions = { truncate: false }
) => {
    if (!model) throw new Error('Model not defined'); // TODO: pass through custom APIError

    const { truncate } = deleteOptions;
    await model.destroy({
        where: { ...queryParams },
        truncate
    });
    return true;
};

/**
 * @link {https://sequelize.org/v5/manual/raw-queries.html} for related documentation in case of expanding
 * @param query
 * @returns {Promise<*>}
 */
const rawQuery = async query => {
    const [results /*, metadata*/] = await sequelize.query(query);
    return results;
};

module.exports = {
    getById,
    getByQuery,
    get,
    create,
    update,
    removeById,
    removeByQuery,
    rawQuery
};
