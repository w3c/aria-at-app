const ModelService = require('./ModelService');

const {
    AT_ATTRIBUTES,
    AT_VERSION_ATTRIBUTES,
    AT_MODE_ATTRIBUTES,
    BROWSER_ATTRIBUTES
} = require('./helpers');
const { Sequelize, At, AtVersion, AtMode } = require('../');
const { clearCachedAts } = require('../loaders/utils');
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

/**
 * @param browserAttributes - Browser attributes
 * @returns {{association: string, attributes: string[]}}
 */
const browserAssociation = browserAttributes => ({
    association: 'browsers',
    attributes: browserAttributes
});

// At

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} options
 * @param {number} options.id - unique id of the At model being queried
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atModeAttributes  - AtMode attributes to be returned in the result
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtById = async ({
    id,
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    t
}) => {
    return ModelService.getById(At, {
        id,
        attributes: atAttributes,
        include: [
            atVersionAssociation(atVersionAttributes),
            atModeAssociation(atModeAttributes),
            browserAssociation(browserAttributes)
        ],
        t
    });
};

/**
 * @param {object} options
 * @param {string|any} options.search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atModeAttributes  - AtMode attributes to be returned in the result
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} options.pagination.limit - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} options.pagination.order - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAts = async ({
    search,
    where = {},
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    pagination = {},
    t
}) => {
    // search and filtering options
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return ModelService.get(At, {
        where,
        attributes: atAttributes,
        include: [
            atVersionAssociation(atVersionAttributes),
            atModeAssociation(atModeAttributes),
            browserAssociation(browserAttributes)
        ],
        pagination,
        t
    });
};

/**
 * @param {object} options
 * @param {object} options.values - values to be used to create the At record
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atModeAttributes  - AtMode attributes to be returned in the result
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const createAt = async ({
    values: { name },
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    t
}) => {
    const atResult = await ModelService.create(At, { values: { name }, t });
    const { id } = atResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return ModelService.getById(At, {
        id,
        attributes: atAttributes,
        include: [
            atVersionAssociation(atVersionAttributes),
            atModeAssociation(atModeAttributes),
            browserAssociation(browserAttributes)
        ],
        t
    });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the At record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atModeAttributes  - AtMode attributes to be returned in the result
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateAtById = async ({
    id,
    values: { name },
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES,
    browserAttributes = BROWSER_ATTRIBUTES,
    t
}) => {
    await ModelService.update(At, { where: { id }, values: { name }, t });

    return ModelService.getById(At, {
        id,
        attributes: atAttributes,
        include: [
            atVersionAssociation(atVersionAttributes),
            atModeAssociation(atModeAttributes),
            browserAssociation(browserAttributes)
        ],
        t
    });
};

/**
 * @param {number} id - id of the At record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeAtById = async ({ id, truncate = false, t }) => {
    clearCachedAts();
    return ModelService.removeById(At, { id, truncate, t });
};

// AtVersion

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {number} options.id - unique id of the AtVersion model being queried
 * @param {object} options
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtVersionById = async ({
    id,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    t
}) => {
    return ModelService.getById(AtVersion, {
        id,
        attributes: atVersionAttributes,
        include: [atAssociation(atAttributes)],
        t
    });
};

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} options
 * @param {object} options.where - unique values of the AtVersion model being queried
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtVersionByQuery = async ({
    where: { atId, name, releasedAt },
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    t
}) => {
    return ModelService.getByQuery(AtVersion, {
        where: {
            atId,
            ...(name && { name }),
            ...(releasedAt && { releasedAt })
        },
        attributes: atVersionAttributes,
        include: [atAssociation(atAttributes)],
        t
    });
};

/**
 * @param {object} options
 * @param {string|any} options.search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} options.pagination.limit - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} options.pagination.order- expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtVersions = async ({
    search,
    where = {},
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    pagination = {},
    t
}) => {
    // search and filtering options
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return ModelService.get(AtVersion, {
        where,
        attributes: atVersionAttributes,
        include: [atAssociation(atAttributes)],
        pagination,
        t
    });
};

/**
 * @param {object} options
 * @param {object} options.createParams - values to be used to create the AtVersion record
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const createAtVersion = async ({
    values: { atId, name, releasedAt },
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    t
}) => {
    await ModelService.create(AtVersion, {
        values: { atId, name, releasedAt },
        t
    });
    clearCachedAts();
    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return ModelService.getByQuery(AtVersion, {
        where: { atId, name },
        attributes: atVersionAttributes,
        include: [atAssociation(atAttributes)],
        t
    });
};

/**
 * @param {object} options
 * @param {object} options.where - values of the AtVersion record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced for {@param queryParams}
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateAtVersionByQuery = async ({
    where: { atId, name, releasedAt },
    values = {},
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    t
}) => {
    await ModelService.update(AtVersion, {
        where: { atId, name, releasedAt },
        values,
        t
    });
    clearCachedAts();
    return ModelService.getByQuery(AtVersion, {
        where: { atId, name: values.name || name, releasedAt },
        attributes: atVersionAttributes,
        include: [atAssociation(atAttributes)],
        t
    });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the AtVersion record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced for {@param queryParams}
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateAtVersionById = async ({
    id,
    values = {},
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    t
}) => {
    await ModelService.update(AtVersion, { where: { id }, values, t });
    clearCachedAts();
    return ModelService.getById(AtVersion, {
        id,
        attributes: atVersionAttributes,
        include: [atAssociation(atAttributes)],
        t
    });
};

/**
 * @param {object} options
 * @param {object} options.where - values of the AtVersion record to be removed
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeAtVersionByQuery = async ({
    where: { atId, name, releasedAt },
    truncate = false,
    t
}) => {
    const result = await ModelService.removeByQuery(AtVersion, {
        where: { atId, name, releasedAt },
        truncate,
        t
    });
    clearCachedAts();
    return result;
};

/**
 * @param {object} options
 * @param {number} options.id - id of the AtVersion record to be removed
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeAtVersionById = async ({ id, truncate = false, t }) => {
    const result = await ModelService.removeById(AtVersion, {
        id,
        truncate,
        t
    });
    clearCachedAts();
    return result;
};

// AtMode

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} options
 * @param {object} options.where - unique values of the AtMode model being queried
 * @param {string[]} options.atModeAttributes - AtMode attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtModeByQuery = async ({
    where: { atId, name },
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    t
}) => {
    return ModelService.getByQuery(AtMode, {
        where: { atId, name },
        attributes: atModeAttributes,
        include: [atAssociation(atAttributes)],
        t
    });
};

/**
 * @param {object} options
 * @param {string|any} options.search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.atModeAttributes - AtMode attributes to be returned in the result
 * @param {string[]} options.atAttributes - At attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} options.pagination.limit - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} options.pagination.order- expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtModes = async ({
    search,
    where = {},
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    pagination = {},
    t
}) => {
    // search and filtering options
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return ModelService.get(AtMode, {
        where,
        attributes: atModeAttributes,
        include: [atAssociation(atAttributes)],
        pagination,
        t
    });
};

/**
 * @param {object} options.options
 * @param {object} options.values - values to be used to create the AtMode record
 * @param {string[]} options.atModeAttributes  - AtMode attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const createAtMode = async ({
    values: { atId, name, screenText, instructions },
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    t
}) => {
    await ModelService.create(AtMode, {
        values: { atId, name, screenText, instructions },
        t
    });

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return ModelService.getByQuery(AtMode, {
        where: { atId, name },
        attributes: atModeAttributes,
        include: [atAssociation(atAttributes)],
        t
    });
};

/**
 * @param {object} options
 * @param {object} options.where - values of the AtMode record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced for {@param queryParams}
 * @param {string[]} options.atModeAttributes - AtMode attributes to be returned in the result
 * @param {string[]} options.atAttributes - At attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateAtModeByQuery = async ({
    where: { atId, name },
    values = {},
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    t
}) => {
    await ModelService.update(AtMode, { where: { atId, name }, values, t });

    return ModelService.getByQuery(AtMode, {
        where: { atId, name: values.name || name },
        attributes: atModeAttributes,
        include: [atAssociation(atAttributes)],
        t
    });
};

/**
 * @param {object} options
 * @param {object} options.where - values of the AtMode record to be removed
 * @param {object} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeAtModeByQuery = async ({
    where: { atId, name },
    truncate = false,
    t
}) => {
    return ModelService.removeByQuery(AtMode, {
        where: { atId, name },
        truncate,
        t
    });
};

const getUniqueAtVersionsForReport = async (testPlanReportId, { t }) => {
    const results = await ModelService.rawQuery(
        `
        select "atVersionId", name, "releasedAt", "testPlanReportId", "testerUserId", "testPlanRunId"
        from ( select distinct "TestPlanReport".id                                              as "testPlanReportId",
                               "TestPlanRun".id                                                 as "testPlanRunId",
                               "TestPlanRun"."testerUserId",
                               (jsonb_array_elements("testResults") ->> 'atVersionId')::integer as "atVersionId"
               from "TestPlanReport"
                        left outer join "TestPlanRun" on "TestPlanRun"."testPlanReportId" = "TestPlanReport".id
               where "testPlanReportId" = ${testPlanReportId}
               group by "TestPlanReport".id, "TestPlanRun".id ) as atVersionResults
                 join "AtVersion" on "AtVersion".id = atVersionResults."atVersionId";
        `,
        { t }
    );

    // Sort in descending order of releasedAt date
    results.sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt));

    return results;
};

/**
 * @param {object} options
 * @param {object} options.values - values to be used to create or find the AtVersion record
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {BrowserVersion}
 */
const findOrCreateAtVersion = async ({
    values: { atId, name, releasedAt },
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    t
}) => {
    let version = await getAtVersionByQuery({
        where: { atId, name },
        atVersionAttributes,
        atAttributes,
        t
    });

    if (!version) {
        /* TODO: releasedAt manually entered by users submitting new version, support actual dates in automation */
        version = await createAtVersion({
            values: { atId, name, releasedAt: releasedAt ?? new Date() },
            atVersionAttributes,
            atAttributes,
            t
        });
    }

    return version;
};

module.exports = {
    // Basic CRUD [At]
    getAtById,
    getAts,
    createAt,
    updateAtById,
    removeAtById,

    // Basic CRUD [AtVersion]
    getAtVersionById,
    getAtVersionByQuery,
    getAtVersions,
    createAtVersion,
    updateAtVersionById,
    updateAtVersionByQuery,
    removeAtVersionByQuery,
    removeAtVersionById,

    // Basic CRUD [AtMode]
    getAtModeByQuery,
    getAtModes,
    createAtMode,
    updateAtModeByQuery,
    removeAtModeByQuery,

    // Custom Methods
    getUniqueAtVersionsForReport,
    findOrCreateAtVersion
};
