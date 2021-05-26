const ModelService = require('./ModelService');
const { BROWSER_ATTRIBUTES, BROWSER_VERSION_ATTRIBUTES } = require('./helpers');
const { Sequelize, Browser, BrowserVersion } = require('../');
const { Op } = Sequelize;

// association helpers to be included with Models' results

/**
 * @param browserAttributes - Browser attributes
 * @returns {{association: string, attributes: string[]}}
 */
const browserAssociation = (browserAttributes) => ({
    association: 'browser',
    attributes: browserAttributes,
});

/**
 * @param browserVersionAttributes - BrowserVersion attributes
 * @returns {{association: string, attributes: string[]}}
 */
const browserVersionAssociation = (browserVersionAttributes) => ({
    association: 'versions',
    attributes: browserVersionAttributes,
});

// Browser

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {number} id - unique id of the Browser model being queried
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @returns {Promise<*>}
 */
const getBrowserById = async (
    id,
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES
) => {
    return ModelService.getById(Browser, id, browserAttributes, [
        browserVersionAssociation(browserVersionAttributes),
    ]);
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @returns {Promise<*>}
 */
const getBrowsers = async (
    search,
    filter = {},
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        Browser,
        where,
        browserAttributes,
        [browserVersionAssociation(browserVersionAttributes)],
        pagination
    );
};

/**
 * @param {object} createParams - values to be used to create the Browser record
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @returns {Promise<*>}
 */
const createBrowser = async (
    { name },
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES
) => {
    const browserResult = await ModelService.create(Browser, { name });
    const { id } = browserResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getById(Browser, id, browserAttributes, [
        browserVersionAssociation(browserVersionAttributes),
    ]);
};

/**
 * @param {number} id - id of the Browser record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @returns {Promise<*>}
 */
const updateBrowser = async (
    id,
    { name },
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES
) => {
    await ModelService.update(Browser, { id }, { name });

    return await ModelService.getById(Browser, id, browserAttributes, [
        browserVersionAssociation(browserVersionAttributes),
    ]);
};

/**
 * @param {number} id - id of the Browser record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeBrowser = async (id, deleteOptions = { truncate: false }) => {
    return await ModelService.removeById(Browser, id, deleteOptions);
};

// BrowserVersion

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} queryParams - unique values of the BrowserVersion model being queried
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @returns {Promise<*>}
 */
const getBrowserVersionByQuery = async (
    { browserId, version },
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES
) => {
    return ModelService.getByQuery(
        BrowserVersion,
        { browserId, version },
        browserVersionAttributes,
        [browserAssociation(browserAttributes)]
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
 * @returns {Promise<*>}
 */
const getBrowserVersions = async (
    search,
    filter = {},
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, version: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        BrowserVersion,
        where,
        browserVersionAttributes,
        [browserAssociation(browserAttributes)],
        pagination
    );
};

/**
 * @param {object} createParams - values to be used to create the BrowserVersion record
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @returns {Promise<*>}
 */
const createBrowserVersion = async (
    { browserId, version },
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES
) => {
    await ModelService.create(BrowserVersion, { browserId, version });

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getByQuery(
        BrowserVersion,
        { browserId, version },
        browserVersionAttributes,
        [browserAssociation(browserAttributes)]
    );
};

/**
 * @param {object} queryParams - values of the BrowserVersion record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param queryParams}
 * @param {string[]} browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} browserAttributes  - Browser attributes to be returned in the result
 * @returns {Promise<*>}
 */
const updateBrowserVersionByQuery = async (
    { browserId, version },
    updateParams = {},
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES
) => {
    await ModelService.update(
        BrowserVersion,
        { browserId, version },
        updateParams
    );

    return await ModelService.getByQuery(
        BrowserVersion,
        { browserId, version: updateParams.version || version },
        browserVersionAttributes,
        [browserAssociation(browserAttributes)]
    );
};

/**
 * @param {object} queryParams - values of the BrowserVersion record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeBrowserVersionByQuery = async (
    { browserId, version },
    deleteOptions = { truncate: false }
) => {
    return await ModelService.removeByQuery(
        BrowserVersion,
        { browserId, version },
        deleteOptions
    );
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
    removeBrowserVersionByQuery,
};
