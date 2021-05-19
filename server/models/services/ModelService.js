const { sequelize } = require('../');

/**
 * Created Query Sequelize Example:
 * UserModel.findOne({
 *   where: { id },
 *   attributes: [ 'username', email ],
 *   include: [
 *     {
 *       model: RoleModel,
 *       as: 'roles'
 *       attributes: [ 'name', 'permissions' ]
 *     }
 *   ]
 * })
 *
 * @example
 * // returns { attribute: 'value', associationData: [ { associationAttribute: 'associationAttributeValue' } ] }
 * return ModelService.getById(Model, id, [ 'attribute' ], [
 *   {
 *     model: AssociationModel,
 *     as: 'associationData',
 *     attributes: [ 'associationAttribute' ]
 *   }
 * ]
 *
 * @param {Model} model - Sequelize Model instance to query for
 * @param {number | string} id - ID of the Sequelize Model to query for
 * @param {any[]} attributes - attributes of the Sequelize Model to be returned
 * @param {any[]} include - information on Sequelize Model relationships
 * @returns {Promise<Model>} - Sequelize Model
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
 * @param {Model} model - Sequelize Model instance to query for
 * @param {object} queryParams - values to be used to query Sequelize Model
 * @param {any[]} attributes - attributes of the Sequelize Model to be returned
 * @param {any[]} include - information on Sequelize Model relationships
 * @returns {Promise<Model>} - Sequelize Model
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
 * @param {Model} model - Sequelize Model instance to query for
 * @param {object} filter - values to be used to search Sequelize Model
 * @param {any[]} attributes - attributes of the Sequelize Model to be returned
 * @param {any[]} include - information on Sequelize Model relationships
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enable})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enable})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enable}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enable=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @returns {Promise<*>} - collection of queried Sequelize Models or paginated structure if pagination flag is enabled
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

    // enable paginated result structure and related values
    if (enable) {
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
 * @param {Model} model - Sequelize Model instance to query for
 * @param {object} createParams - properties to be used to create the {@param model} Sequelize Model that is being used
 * @returns {Promise<*>} - result of the sequelize.create function
 */
const create = async (model, createParams) => {
    if (!model) throw new Error('Model not defined'); // TODO: pass through custom APIError
    return await model.create({ ...createParams });
};

/**
 * @param {Model} model - Sequelize Model instance to query for
 * @param {object} queryParams - query to be used to find the Sequelize Model to be updated
 * @param {object} updateParams - values to be updated when the Sequelize Model is found
 * @returns {Promise<*>} - result of the sequelize.update function
 */
const update = async (model, queryParams, updateParams) => {
    if (!model) throw new Error('Model not defined'); // TODO: pass through custom APIError

    return await model.update(
        { ...updateParams },
        { where: { ...queryParams } }
    );
};

/**
 * See {@link https://sequelize.org/v5/class/lib/model.js~Model.html#static-method-destroy}
 * @param {Model} model - Sequelize Model instance to query for
 * @param {number | string} id - ID of the Sequelize Model to be removed
 * @param {object} deleteOptions - additional Sequelize deletion options
 * @param {boolean} [deleteOptions.truncate=false] - enables the truncate option to be used when running a deletion
 * @returns {Promise<boolean>} - returns true if record was deleted
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
 * @param {Model} model - Sequelize Model instance to query for
 * @param queryParams - query params to be used to find the Sequelize Models to be removed
 * @param {object} deleteOptions - additional Sequelize deletion options
 * @param {boolean} [deleteOptions.truncate=false] - enables the truncate option to be used when running a deletion
 * @returns {Promise<boolean>} - returns true if record was deleted
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
 * See @link {https://sequelize.org/v5/manual/raw-queries.html} for related documentation in case of expanding
 * @param {string} query - raw SQL query string to be executed
 * @returns {Promise<*>} - results of the raw SQL query after being ran
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
