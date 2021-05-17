const ModelService = require('./ModelService');
const { BROWSER_ATTRIBUTES, BROWSER_VERSION_ATTRIBUTES } = require('./helpers');
const { Sequelize, Browser, BrowserVersion } = require('../index');
const { Op } = Sequelize;

// Section :- association helpers to be included with Models' results
const browserAssociation = browserAttributes => ({
    association: 'browserObject',
    browserAttributes: browserAttributes
});

const browserVersionAssociation = browserVersionAttributes => ({
    association: 'versions',
    attributes: browserVersionAttributes
});

// Browser

const getBrowserById = async (
    id,
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES
) => {
    return ModelService.getById(Browser, id, browserAttributes, [
        browserVersionAssociation(browserVersionAttributes)
    ]);
};

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

const createBrowser = async (
    { name },
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES
) => {
    const atResult = await ModelService.create(Browser, { name });
    const { id } = atResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getById(Browser, id, browserAttributes, [
        browserVersionAssociation(browserVersionAttributes)
    ]);
};

const updateBrowser = async (
    id,
    { name },
    browserAttributes = BROWSER_ATTRIBUTES,
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES
) => {
    await ModelService.update(Browser, { id }, { name });

    return await ModelService.getById(Browser, id, browserAttributes, [
        browserVersionAssociation(browserVersionAttributes)
    ]);
};

const removeBrowser = async (id, deleteOptions = { truncate: false }) => {
    return await ModelService.removeById(Browser, id, deleteOptions);
};

// BrowserVersion

const getBrowserVersionByQuery = async (
    { browser, version },
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES
) => {
    return ModelService.getByQuery(
        BrowserVersion,
        { browser, version },
        browserVersionAttributes,
        [browserAssociation(browserAttributes)]
    );
};

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

const createBrowserVersion = async (
    { browser, version },
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES
) => {
    await ModelService.create(BrowserVersion, { browser, version });

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getByQuery(
        BrowserVersion,
        { browser, version },
        browserVersionAttributes,
        [browserAssociation(browserAttributes)]
    );
};

const updateBrowserVersionByQuery = async (
    id,
    { browser, version },
    browserVersionAttributes = BROWSER_VERSION_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES
) => {
    await ModelService.update(
        BrowserVersion,
        { browser, version },
        { version }
    );

    return await ModelService.getByQuery(
        BrowserVersion,
        { browser, version },
        browserVersionAttributes,
        [browserAssociation(browserAttributes)]
    );
};

const removeBrowserVersionByQuery = async (
    { browser, version },
    deleteOptions = { truncate: false }
) => {
    return await ModelService.removeById(
        BrowserVersion,
        { browser, version },
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

    // Constants
    BROWSER_ATTRIBUTES,
    BROWSER_VERSION_ATTRIBUTES
};
