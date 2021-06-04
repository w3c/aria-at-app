const ModelService = require('./ModelService');
const {
    AT_ATTRIBUTES,
    AT_VERSION_ATTRIBUTES,
    AT_MODE_ATTRIBUTES
} = require('./helpers');
const { Sequelize, At, AtVersion, AtMode } = require('../');
const { Op } = Sequelize;

// association helpers to be included with Models' results

/**
 * @param atAttributes - At attributes
 * @returns {{association: string, attributes: string[]}}
 */
const atAssociation = atAttributes => ({
    association: 'at',
    attributes: atAttributes
});

/**
 * @param atVersionAttributes - AtVersion attributes
 * @returns {{association: string, attributes: string[]}}
 */
const atVersionAssociation = atVersionAttributes => ({
    association: 'atVersions',
    attributes: atVersionAttributes
});

/**
 * @param atModeAttributes - AtMode attributes
 * @returns {{association: string, attributes: string[]}}
 */
const atModeAssociation = atModeAttributes => ({
    association: 'modes',
    attributes: atModeAttributes
});

// At

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {number} id - unique id of the At model being queried
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atModeAttributes  - AtMode attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtById = async (
    id,
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES,
    options = {}
) => {
    return ModelService.getById(
        At,
        id,
        atAttributes,
        [
            atVersionAssociation(atVersionAttributes),
            atModeAssociation(atModeAttributes)
        ],
        options
    );
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atModeAttributes  - AtMode attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAts = async (
    search,
    filter = {},
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES,
    pagination = {},
    options = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        At,
        where,
        atAttributes,
        [
            atVersionAssociation(atVersionAttributes),
            atModeAssociation(atModeAttributes)
        ],
        pagination,
        options
    );
};

/**
 * @param {object} createParams - values to be used to create the At record
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atModeAttributes  - AtMode attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createAt = async (
    { name },
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES,
    options = {}
) => {
    const atResult = await ModelService.create(At, { name });
    const { id } = atResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getById(
        At,
        id,
        atAttributes,
        [
            atVersionAssociation(atVersionAttributes),
            atModeAssociation(atModeAttributes)
        ],
        options
    );
};

/**
 * @param {number} id - id of the At record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atModeAttributes  - AtMode attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateAt = async (
    id,
    { name },
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES,
    options = {}
) => {
    await ModelService.update(At, { id }, { name }, options);

    return await ModelService.getById(
        At,
        id,
        atAttributes,
        [
            atVersionAssociation(atVersionAttributes),
            atModeAssociation(atModeAttributes)
        ],
        options
    );
};

/**
 * @param {number} id - id of the At record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeAt = async (id, deleteOptions = { truncate: false }) => {
    return await ModelService.removeById(At, id, deleteOptions);
};

// AtVersion

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} queryParams - unique values of the AtVersion model being queried
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtVersionByQuery = async (
    { atId, atVersion },
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    options = {}
) => {
    return ModelService.getByQuery(
        AtVersion,
        { atId, atVersion },
        atVersionAttributes,
        [atAssociation(atAttributes)],
        options
    );
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtVersions = async (
    search,
    filter = {},
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    pagination = {},
    options = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery)
        where = { ...where, atVersion: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        AtVersion,
        where,
        atVersionAttributes,
        [atAssociation(atAttributes)],
        pagination,
        options
    );
};

/**
 * @param {object} createParams - values to be used to create the AtVersion record
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createAtVersion = async (
    { atId, atVersion },
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    options = {}
) => {
    await ModelService.create(AtVersion, { atId, atVersion });

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getByQuery(
        AtVersion,
        { atId, atVersion },
        atVersionAttributes,
        [atAssociation(atAttributes)],
        options
    );
};

/**
 * @param {object} queryParams - values of the AtVersion record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param queryParams}
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateAtVersionByQuery = async (
    { atId, atVersion },
    updateParams = {},
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    options = {}
) => {
    await ModelService.update(AtVersion, { atId, atVersion }, updateParams);

    return await ModelService.getByQuery(
        AtVersion,
        { atId, atVersion: updateParams.atVersion || atVersion },
        atVersionAttributes,
        [atAssociation(atAttributes)],
        options
    );
};

/**
 * @param {object} queryParams - values of the AtVersion record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeAtVersionByQuery = async (
    { atId, atVersion },
    deleteOptions = { truncate: false }
) => {
    return await ModelService.removeByQuery(
        AtVersion,
        { atId, atVersion },
        deleteOptions
    );
};

// AtMode

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} queryParams - unique values of the AtMode model being queried
 * @param {string[]} atModeAttributes - AtMode attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtModeByQuery = async (
    { atId, name },
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    options = {}
) => {
    return ModelService.getByQuery(
        AtMode,
        { atId, name },
        atModeAttributes,
        [atAssociation(atAttributes)],
        options
    );
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} atModeAttributes - AtMode attributes to be returned in the result
 * @param {string[]} atAttributes - At attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtModes = async (
    search,
    filter = {},
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    pagination = {},
    options = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        AtMode,
        where,
        atModeAttributes,
        [atAssociation(atAttributes)],
        pagination,
        options
    );
};

/**
 * @param {object} createParams - values to be used to create the AtMode record
 * @param {string[]} atModeAttributes  - AtMode attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createAtMode = async (
    { atId, name },
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    options = {}
) => {
    await ModelService.create(AtMode, { atId, name });

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getByQuery(
        AtMode,
        { atId, name },
        atModeAttributes,
        [atAssociation(atAttributes)],
        options
    );
};

/**
 * @param {object} queryParams - values of the AtMode record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param queryParams}
 * @param {string[]} atModeAttributes - AtMode attributes to be returned in the result
 * @param {string[]} atAttributes - At attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateAtModeByQuery = async (
    { atId, name },
    updateParams = {},
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    options = {}
) => {
    await ModelService.update(AtMode, { atId, name }, updateParams);

    return await ModelService.getByQuery(
        AtMode,
        { atId, name: updateParams.name || name },
        atModeAttributes,
        [atAssociation(atAttributes)],
        options
    );
};

/**
 * @param {object} queryParams - values of the AtMode record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeAtModeByQuery = async (
    { atId, name },
    deleteOptions = { truncate: false }
) => {
    return await ModelService.removeByQuery(
        AtMode,
        { atId, name },
        deleteOptions
    );
};

module.exports = {
    // Basic CRUD [At]
    getAtById,
    getAts,
    createAt,
    updateAt,
    removeAt,

    // Basic CRUD [AtVersion]
    getAtVersionByQuery,
    getAtVersions,
    createAtVersion,
    updateAtVersionByQuery,
    removeAtVersionByQuery,

    // Basic CRUD [AtMode]
    getAtModeByQuery,
    getAtModes,
    createAtMode,
    updateAtModeByQuery,
    removeAtModeByQuery
};
