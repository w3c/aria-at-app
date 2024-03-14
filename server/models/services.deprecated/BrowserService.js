const ModelService = require('./ModelService');
const {
    BROWSER_ATTRIBUTES,
    BROWSER_VERSION_ATTRIBUTES,
    AT_ATTRIBUTES
} = require('./helpers');
const { Sequelize, Browser, BrowserVersion } = require('../');
const { clearCachedBrowsers } = require('../loaders/utils');
const { Op } = Sequelize;

// association helpers to be included with Models' results

/**
 * @param browserAttributes - Browser attributes
 * @returns {{association: string, attributes: string[]}}
 */
const browserAssociation = browserAttributes => ({
    association: 'browser',
    attributes: browserAttributes
});

/**
 * @param browserVersionAttributes - BrowserVersion attributes
 * @returns {{association: string, attributes: string[]}}
 */
const browserVersionAssociation = browserVersionAttributes => ({
    association: 'browserVersions',
    attributes: browserVersionAttributes
});

/**
 * @param atAttributes - At attributes
 * @returns {{association: string, attributes: string[]}}
 */
const atAssociation = atAttributes => ({
    association: 'ats',
    attributes: atAttributes
});

// Browser

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {number} id - unique id of the Browser model being queried
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getBrowserById = async (
    id,
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    options = {}
) => {
    return ModelService.getById(
        Browser,
        id,
        browserAttributes,
        [
            browserVersionAssociation(browserVersionAttributes),
            atAssociation(atAttributes)
        ],
        options
    );
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
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
const getBrowsers = async (
    search,
    filter = {},
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    pagination = {},
    options = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        Browser,
        where,
        browserAttributes,
        [
            browserVersionAssociation(browserVersionAttributes),
            atAssociation(atAttributes)
        ],
        pagination,
        options
    );
};

/**
 * @param {object} createParams - values to be used to create the Browser record
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createBrowser = async (
    { name },
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    options = {}
) => {
    const browserResult = await ModelService.create(Browser, { name }, options);
    const { id } = browserResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getById(
        Browser,
        id,
        browserAttributes,
        [
            browserVersionAssociation(browserVersionAttributes),
            atAssociation(atAttributes)
        ],
        options
    );
};

/**
 * @param {number} id - id of the Browser record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateBrowser = async (
    id,
    { name },
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    options = {}
) => {
    await ModelService.update(Browser, { id }, { name }, options);

    return await ModelService.getById(
        Browser,
        id,
        browserAttributes,
        [
            browserVersionAssociation(browserVersionAttributes),
            atAssociation(atAttributes)
        ],
        options
    );
};

/**
 * @param {number} id - id of the Browser record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeBrowser = async (id, deleteOptions = { truncate: false }) => {
    clearCachedBrowsers();
    return await ModelService.removeById(Browser, id, deleteOptions);
};

// BrowserVersion

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} queryParams - unique values of the BrowserVersion model being queried
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getBrowserVersionByQuery = async (
    { browserId, name },
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    options = {}
) => {
    return ModelService.getByQuery(
        BrowserVersion,
        { browserId, ...(name && { name }) },
        browserVersionAttributes,
        [browserAssociation(browserAttributes)],
        options
    );
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getBrowserVersions = async (
    search,
    filter = {},
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    pagination = {},
    options = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        BrowserVersion,
        where,
        browserVersionAttributes,
        [browserAssociation(browserAttributes)],
        pagination,
        options
    );
};

/**
 * @param {object} createParams - values to be used to create the BrowserVersion record
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createBrowserVersion = async (
    { browserId, name },
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    options = {}
) => {
    await ModelService.create(BrowserVersion, { browserId, name }, options);

    clearCachedBrowsers();
    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getByQuery(
        BrowserVersion,
        { browserId, name },
        browserVersionAttributes,
        [browserAssociation(browserAttributes)],
        options
    );
};

/**
 * @param {object} queryParams - values of the BrowserVersion record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param queryParams}
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateBrowserVersionByQuery = async (
    { browserId, name },
    updateParams = {},
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    options = {}
) => {
    await ModelService.update(
        BrowserVersion,
        { browserId, name },
        updateParams,
        options
    );

    clearCachedBrowsers();
    return await ModelService.getByQuery(
        BrowserVersion,
        {
            browserId,
            name: updateParams.name || name
        },
        browserVersionAttributes,
        [browserAssociation(browserAttributes)],
        options
    );
};

/**
 * @param {number} id - Postgres ID of BrowserVersion record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param queryParams}
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateBrowserVersionById = async (
    id,
    updateParams = {},
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    options = {}
) => {
    await ModelService.update(BrowserVersion, { id }, updateParams, options);

    clearCachedBrowsers();
    return await ModelService.getById(
        BrowserVersion,
        id,
        browserVersionAttributes,
        [browserAssociation(browserAttributes)],
        options
    );
};

/**
 * @param {object} queryParams - values of the BrowserVersion record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeBrowserVersionByQuery = async (
    { browserId, name },
    deleteOptions = { truncate: false }
) => {
    clearCachedBrowsers();
    return await ModelService.removeByQuery(
        BrowserVersion,
        { browserId, name },
        deleteOptions
    );
};

/**
 * @param {object} id - id of the BrowserVersion record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeBrowserVersionById = async (
    id,
    deleteOptions = { truncate: false }
) => {
    clearCachedBrowsers();
    return await ModelService.removeById(BrowserVersion, id, deleteOptions);
};

/**
 * @param {object} params - values to be used to create or find the BrowserVersion record
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {BrowserVersion}
 */
const findOrCreateBrowserVersion = async (
    { browserId, name },
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    options = {}
) => {
    let version = await getBrowserVersionByQuery(
        { browserId, name },
        browserVersionAttributes,
        browserAttributes,
        options
    );

    if (!version) {
        version = await createBrowserVersion({ browserId, name });
    }

    return version;
};

module.exports = {
    // Basic CRUD [Browser]
    getBrowserById,
    getBrowsers,
    createBrowser,
    updateBrowser,
    removeBrowser,

    // Basic CRUD [BrowserVersion]
    getBrowserVersionByQuery,
    getBrowserVersions,
    createBrowserVersion,
    updateBrowserVersionByQuery,
    updateBrowserVersionById,
    removeBrowserVersionByQuery,
    removeBrowserVersionById,

    // Custom [BrowserVersion]
    findOrCreateBrowserVersion
};
