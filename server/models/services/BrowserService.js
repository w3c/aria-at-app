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
 * @param {object} options
 * @param {number} options.id - unique id of the Browser model being queried
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {string[]} options.browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const getBrowserById = async ({
    id,
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    t
}) => {
    return ModelService.getById(Browser, {
        id,
        attributes: browserAttributes,
        include: [
            browserVersionAssociation(browserVersionAttributes),
            atAssociation(atAttributes)
        ],
        t
    });
};

/**
 * @param {object} options
 * @param {string|any} options.search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {string[]} options.browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} options.pagination.limit - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} options.pagination.order- expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const getBrowsers = async ({
    search,
    where = {},
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    pagination = {},
    t
}) => {
    // search and filtering options
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return ModelService.get(Browser, {
        where,
        attributes: browserAttributes,
        include: [
            browserVersionAssociation(browserVersionAttributes),
            atAssociation(atAttributes)
        ],
        pagination,
        t
    });
};

/**
 * @param {object} options
 * @param {object} options.values - values to be used to create the Browser record
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {string[]} options.browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const createBrowser = async ({
    values: { name },
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    t
}) => {
    const browserResult = await ModelService.create(Browser, {
        values: { name },
        t
    });
    const { id } = browserResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return ModelService.getById(Browser, {
        id,
        attributes: browserAttributes,
        include: [
            browserVersionAssociation(browserVersionAttributes),
            atAssociation(atAttributes)
        ],
        t
    });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the Browser record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {string[]} options.browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateBrowserById = async ({
    id,
    values: { name },
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    t
}) => {
    await ModelService.update(Browser, { where: { id }, values: { name }, t });

    return ModelService.getById(Browser, {
        id,
        attributes: browserAttributes,
        include: [
            browserVersionAssociation(browserVersionAttributes),
            atAssociation(atAttributes)
        ],
        t
    });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the Browser record to be removed
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeBrowserById = async ({ id, truncate = false, t }) => {
    const result = await ModelService.removeById(Browser, { id, truncate, t });
    clearCachedBrowsers();
    return result;
};

// BrowserVersion

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} options
 * @param {object} options.where - unique values of the BrowserVersion model being queried
 * @param {string[]} options.browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const getBrowserVersionByQuery = async ({
    where: { browserId, name },
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    t
}) => {
    return ModelService.getByQuery(BrowserVersion, {
        where: { browserId, ...(name && { name }) },
        attributes: browserVersionAttributes,
        include: [browserAssociation(browserAttributes)],
        t
    });
};

/**
 * @param {object} options
 * @param {string|any} options.search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} options.pagination.limit - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} options.pagination.order- expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const getBrowserVersions = async ({
    search,
    where = {},
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    pagination = {},
    t
}) => {
    // search and filtering options
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return ModelService.get(BrowserVersion, {
        where,
        attributes: browserVersionAttributes,
        include: [browserAssociation(browserAttributes)],
        pagination,
        t
    });
};

/**
 * @param {object} options
 * @param {object} options.values - values to be used to create the BrowserVersion record
 * @param {string[]} options.browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const createBrowserVersion = async ({
    values: { browserId, name },
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    t
}) => {
    await ModelService.create(BrowserVersion, {
        values: { browserId, name },
        t
    });
    clearCachedBrowsers();
    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return ModelService.getByQuery(BrowserVersion, {
        where: { browserId, name },
        attributes: browserVersionAttributes,
        include: [browserAssociation(browserAttributes)],
        t
    });
};

/**
 * @param {object} options
 * @param {object} options.where - values of the BrowserVersion record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced for {@param queryParams}
 * @param {string[]} options.browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateBrowserVersionByQuery = async ({
    where: { browserId, name },
    values = {},
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    t
}) => {
    await ModelService.update(BrowserVersion, {
        where: { browserId, name },
        values,
        t
    });
    clearCachedBrowsers();
    return ModelService.getByQuery(BrowserVersion, {
        where: {
            browserId,
            name: values.name || name
        },
        attributes: browserVersionAttributes,
        include: [browserAssociation(browserAttributes)],
        t
    });
};

/**
 * @param {object} options
 * @param {number} options.id - Postgres ID of BrowserVersion record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced for {@param queryParams}
 * @param {string[]} options.browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateBrowserVersionById = async ({
    id,
    values = {},
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    t
}) => {
    await ModelService.update(BrowserVersion, { where: { id }, values, t });
    clearCachedBrowsers();
    return ModelService.getById(BrowserVersion, {
        id,
        attributes: browserVersionAttributes,
        include: [browserAssociation(browserAttributes)],
        t
    });
};

/**
 * @param {object} options
 * @param {object} options.where - values of the BrowserVersion record to be removed
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeBrowserVersionByQuery = async ({
    where: { browserId, name },
    truncate = false,
    t
}) => {
    const result = await ModelService.removeByQuery(BrowserVersion, {
        where: { browserId, name },
        truncate,
        t
    });
    clearCachedBrowsers();
    return result;
};

/**
 * @param {object} options
 * @param {object} options.id - id of the BrowserVersion record to be removed
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeBrowserVersionById = async ({ id, truncate = false, t }) => {
    const result = await ModelService.removeById(BrowserVersion, {
        id,
        truncate,
        t
    });
    clearCachedBrowsers();
    return result;
};

/**
 * @param {object} options
 * @param {object} options.where - values to be used to create or find the BrowserVersion record
 * @param {string[]} options.browserVersionAttributes  - BrowserVersion attributes to be returned in the result
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {BrowserVersion}
 */
const findOrCreateBrowserVersion = async ({
    where: { browserId, name },
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    t
}) => {
    let version = await getBrowserVersionByQuery({
        where: { browserId, name },
        browserVersionAttributes,
        browserAttributes,
        t
    });

    if (!version) {
        version = await createBrowserVersion({
            values: { browserId, name },
            t
        });
    }

    return version;
};

module.exports = {
    // Basic CRUD [Browser]
    getBrowserById,
    getBrowsers,
    createBrowser,
    updateBrowserById,
    removeBrowserById,

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
