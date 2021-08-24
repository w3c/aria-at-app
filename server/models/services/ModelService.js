const { isFunction, isEqualWith, sortBy } = require('lodash');
const { sequelize } = require('../');

/**
 * Allows ModelService functions to use transactions internally while also supporting an outer, parent transaction.
 *
 * Creates a managed transaction if one does not already exist - if there is a parent transaction it will not commit or rollback, leaving those steps to the parent.
 *
 * Works with dbCleaner.
 * @param {*} providedTransaction - An OPTIONAL existing transaction. In test environments this defaults to a test transaction managed by dbCleaner.
 * @param {function} callback - An async function which takes a transaction as its argument
 * @returns {*} - Returns whatever the callback returns
 */
const confirmTransaction = async (
    providedTransaction = global.globalTestTransaction,
    callback
) => {
    const isProvided = !!providedTransaction;
    const transaction = providedTransaction || (await sequelize.transaction());

    try {
        const result = await callback(transaction);
        if (!isProvided) {
            await transaction.commit();
        }
        return result;
    } catch (error) {
        if (!isProvided) {
            await transaction.rollback();
        }
        throw error;
    }
};

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
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<Model>} - Sequelize Model
 */
const getById = async (
    model,
    id,
    attributes = [],
    include = [],
    options = {}
) => {
    if (!model) throw new Error('Model not defined');
    const { transaction = global.globalTestTransaction } = options;

    // findByPk
    return await model.findOne({
        where: { id },
        attributes,
        include,
        transaction
    });
};

/**
 * @param {Model} model - Sequelize Model instance to query for
 * @param {object} queryParams - values to be used to query Sequelize Model
 * @param {any[]} attributes - attributes of the Sequelize Model to be returned
 * @param {any[]} include - information on Sequelize Model relationships
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<Model>} - Sequelize Model
 */
const getByQuery = async (
    model,
    queryParams,
    attributes = [],
    include = [],
    options = {}
) => {
    if (!model) throw new Error('Model not defined');
    const { transaction = global.globalTestTransaction } = options;

    return await model.findOne({
        where: { ...queryParams },
        attributes,
        include,
        transaction
    });
};

/**
 * @link {https://sequelize.org/v5/manual/models-usage.html#-code-findandcountall--code----search-for-multiple-elements-in-the-database--returns-both-data-and-total-count}
 * @param {Model} model - Sequelize Model instance to query for
 * @param {object} where - values to be used to search Sequelize Model
 * @param {any[]} attributes - attributes of the Sequelize Model to be returned
 * @param {any[]} include - information on Sequelize Model relationships
 * @param {object} pagination - pagination options for query (page and limit; it also includes sorting functionality)
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>} - collection of queried Sequelize Models or paginated structure if pagination flag is enabled
 */
const get = async (
    model,
    where = {}, // passed in search and filtering options
    attributes = [],
    include = [],
    pagination = {},
    options = {}
) => {
    if (!model) throw new Error('Model not defined');
    const { transaction = global.globalTestTransaction } = options;

    // pagination and sorting options
    let {
        page = 0,
        limit = 10,
        order = [],
        enablePagination = false
    } = pagination; // page 0->1, 1->2; manage through middleware
    // 'order' structure eg. [ [ 'username', 'DESC' ], [..., ...], ... ]
    if (page < 0) page = 0;
    if (limit < 0 || !enablePagination) limit = null;
    const offset = limit < 0 || !limit ? 0 : page * limit; // skip (1 * 10 results) = 10 to get get to page 2

    const queryOptions = {
        where,
        order,
        attributes,
        include, // included fields being marked as 'required' will affect overall count for pagination
        transaction
    };

    // enablePagination paginated result structure and related values
    if (enablePagination) {
        const result = await model.findAndCountAll({
            ...queryOptions,
            limit,
            offset,
            distinct: true // applies distinct SQL rule to avoid duplicates created by 'includes' affecting count
        });

        const { count: totalResultsCount, rows: data } = result;
        const resultsCount = data.length;
        const pagesCount = limit ? Math.ceil(totalResultsCount / limit) : 1;

        return {
            page: page + 1,
            pageSize: limit,
            pagesCount,
            resultsCount,
            totalResultsCount,
            data
        };
    }
    return await model.findAll({ ...queryOptions });
};

/**
 * @param {Model} model - Sequelize Model instance to query for
 * @param {object} createParams - properties to be used to create the {@param model} Sequelize Model that is being used
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>} - result of the sequelize.create function
 */
const create = async (model, createParams, options = {}) => {
    if (!model) throw new Error('Model not defined');
    const { transaction = global.globalTestTransaction } = options;
    return await model.create({ ...createParams }, { transaction });
};

/**
 * @param {Model} model - Sequelize Model instance to query for
 * @param {object} createParamsArray - array of properties to be used to create the {@param model} Sequelize Model that is being used
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>} - result of the sequelize.create function
 */
const bulkCreate = async (model, createParamsArray, options = {}) => {
    if (!model) throw new Error('Model not defined');
    const { transaction = global.globalTestTransaction } = options;
    return await model.bulkCreate(createParamsArray, { transaction });
};

/**
 * @param {Model} model - Sequelize Model instance to query for
 * @param {object} queryParams - query to be used to find the Sequelize Model to be updated
 * @param {object} updateParams - values to be updated when the Sequelize Model is found
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>} - result of the sequelize.update function
 */
const update = async (model, queryParams, updateParams, options = {}) => {
    if (!model) throw new Error('Model not defined');
    const { transaction = global.globalTestTransaction } = options;

    return await model.update(
        { ...updateParams },
        { where: { ...queryParams }, transaction }
    );
};

/**
 * Gets or creates multiple records for multiple models as part of a
 * single transaction.
 *
 * Accepts an array of objects specifying the get and create functions for the
 * model, the values to get or create, and the attributes to use when returning
 * the final result.
 *
 * If you need the result of previous operations, e.g. the ids, you can pass a
 * function instead of an object.
 *
 * If you need to update fields but do not want to use them in the get query,
 * you can specify an update function and updateValues.
 *
 * Returns an array of results, where each item is an array containing the model
 * instance and a boolean for whether it was newly created.
 *
 * @example
 * const results = await ModelService.nestedGetOrCreate([
 *     {
 *         get: getAtVersions,
 *         create: createAtVersion,
 *         values: { atId, atVersion },
 *         returnAttributes: [null, []]
 *     },
 *     {
 *         get: getBrowserVersions,
 *         create: createBrowserVersion,
 *         values: { browserId, browserVersion },
 *         returnAttributes: [null, []]
 *     },
 *     {
 *         get: getTestPlanTargets,
 *         create: createTestPlanTarget,
 *         values: { atId, browserId, atVersion, browserVersion },
 *         returnAttributes: [null]
 *     },
 *     accumulatedResults => {
 *         const [testPlanTarget] = accumulatedResults[2];
 *         return {
 *             get: getTestPlanReports,
 *             create: createTestPlanReport,
 *             update: updateTestPlanReport,
 *             values: {
 *                 testPlanTargetId: testPlanTarget.id,
 *                 testPlanVersionId: testPlanVersionId
 *             },
 *             updateValues: { status },
 *             returnAttributes: [null, [], [], [], []]
 *         };
 *     }
 * ]);
 *
 * const [
 *     [atVersion, isNewAtVersion],
 *     [browserVersion, isNewBrowserVersion],
 *     [testPlanTarget, isNewTestPlanTarget],
 *     [testPlanReport, isNewTestPlanReport],
 * ] = results;
 *
 * @param {[object|function]} getOptionsArray
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<[[*,Boolean]]>}
 */
const nestedGetOrCreate = async (getOptionsArray, options = {}) => {
    return confirmTransaction(options.transaction, async transaction => {
        let accumulatedResults = [];
        for (const getOptions of getOptionsArray) {
            const {
                get,
                create,
                update,
                values,
                updateValues,
                bulkGetOrReplace,
                bulkGetOrReplaceWhere,
                returnAttributes
            } = isFunction(getOptions)
                ? getOptions(accumulatedResults)
                : getOptions;

            if (bulkGetOrReplace) {
                if (get || create || update) {
                    throw new Error(
                        'Cannot mix bulkGetOrReplace with get, create or ' +
                            'update, because one works with an array and the ' +
                            'others work with a single record'
                    );
                }
                const [
                    records,
                    isUpdated
                ] = await bulkGetOrReplace(
                    bulkGetOrReplaceWhere,
                    values,
                    ...returnAttributes,
                    { transaction }
                );
                accumulatedResults.push([records, isUpdated]);
                continue;
            }

            const noSearch = '';
            const noPagination = {};

            const found = await get(
                noSearch,
                values,
                ...returnAttributes,
                noPagination,
                { transaction }
            );

            if (found.length) {
                if (updateValues) {
                    await update(
                        found[0].id,
                        updateValues,
                        ...returnAttributes,
                        { transaction }
                    );
                }
                accumulatedResults.push([found[0], false]);
                continue;
            }

            const created = await create(
                { ...values, ...updateValues },
                ...returnAttributes,
                { transaction }
            );

            accumulatedResults.push([created, true]);
        }

        return accumulatedResults;
    });
};

/**
 * Allows you to bulk replace an array of records, such as the roles for a user.
 * @example
 * await bulkGetOrReplace(
 *   UserRoles,
 *   { userId: 1 },
 *   [{ roleName: 'TESTER' }, { roleName: 'ADMIN' }]
 * );
 *
 * @param {Model} model - Sequelize Model instance to query for
 * @param {object} where - values to be used to search Sequelize Model. Only supports exact values.
 * @param {object} expectedValues - values to be replaced. Note the "where" values will be merged in so they do not need to be duplicated here.
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<boolean>} - True / false if the records were replaced
 */
const bulkGetOrReplace = async (Model, where, expectedValues, options = {}) => {
    return confirmTransaction(options.transaction, async transaction => {
        if (expectedValues.length === 0) {
            throw new Error('At least one expected value is required!');
        }
        const comparisonKeys = Object.keys(expectedValues[0]);
        const whereKeys = Object.keys(where);

        const noInclude = [];
        const noPagination = {};
        const persistedValues = await get(
            Model,
            where,
            [...whereKeys, ...comparisonKeys],
            noInclude,
            noPagination,
            { transaction }
        );

        const isUpdated = !isEqualWith(
            sortBy(persistedValues, comparisonKeys),
            sortBy(expectedValues, comparisonKeys),
            (persisted, expected, index) => {
                // See https://github.com/lodash/lodash/issues/2490
                if (index === undefined) return;

                return !comparisonKeys.find(comparisonKey => {
                    return persisted[comparisonKey] !== expected[comparisonKey];
                });
            }
        );

        if (isUpdated) {
            // eslint-disable-next-line no-use-before-define
            await removeByQuery(Model, where, { transaction });

            const fullRecordValues = expectedValues.map(expectedValue => ({
                ...where,
                ...expectedValue
            }));

            await bulkCreate(Model, fullRecordValues, { transaction });
        }

        return isUpdated;
    });
};

/**
 * See {@link https://sequelize.org/v5/class/lib/model.js~Model.html#static-method-destroy}
 * @param {Model} model - Sequelize Model instance to query for
 * @param {number | string} id - ID of the Sequelize Model to be removed
 * @param {object} options - additional Sequelize deletion and generic options
 * @param {boolean} [options.truncate=false] - enables the truncate option to be used when running a deletion
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<boolean>} - returns true if record was deleted
 */
const removeById = async (model, id, options = {}) => {
    if (!model) throw new Error('Model not defined');
    const {
        truncate = false,
        transaction = global.globalTestTransaction
    } = options;

    await model.destroy({
        where: { id },
        truncate,
        transaction
    });
    return true;
};

/**
 * @param {Model} model - Sequelize Model instance to query for
 * @param queryParams - query params to be used to find the Sequelize Models to be removed
 * @param {object} options - additional Sequelize deletion and generic options
 * @param {boolean} [options.truncate=false] - enables the truncate option to be used when running a deletion
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<boolean>} - returns true if record was deleted
 */
const removeByQuery = async (model, queryParams, options = {}) => {
    if (!model) throw new Error('Model not defined');
    const {
        truncate = false,
        transaction = global.globalTestTransaction
    } = options;

    await model.destroy({
        where: { ...queryParams },
        truncate,
        transaction
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
    confirmTransaction,
    getById,
    getByQuery,
    get,
    create,
    bulkCreate,
    update,
    bulkGetOrReplace,
    nestedGetOrCreate,
    removeById,
    removeByQuery,
    rawQuery
};
