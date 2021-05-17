const ModelService = require('./ModelService');
const {
    AT_ATTRIBUTES,
    AT_VERSION_ATTRIBUTES,
    AT_MODE_ATTRIBUTES
} = require('./helpers');
const { Sequelize, At, AtVersion, AtMode } = require('../index');
const { Op } = Sequelize;

// Section :- association helpers to be included with Models' results
const atAssociation = atAttributes => ({
    association: 'atObject',
    atAttributes: atAttributes
});

const atVersionAssociation = atVersionAttributes => ({
    association: 'versions',
    attributes: atVersionAttributes
});

const atModeAssociation = atModeAttributes => ({
    association: 'modes',
    attributes: atModeAttributes
});

// At
const getAtById = async (
    id,
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES
) => {
    return ModelService.getById(At, id, atAttributes, [
        atVersionAssociation(atVersionAttributes),
        atModeAssociation(atModeAttributes)
    ]);
};

const getAts = async (
    search,
    filter = {},
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES,
    pagination = {}
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
        pagination
    );
};

const createAt = async (
    { name },
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES
) => {
    const atResult = await ModelService.create(At, { name });
    const { id } = atResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getById(At, id, atAttributes, [
        atVersionAssociation(atVersionAttributes),
        atModeAssociation(atModeAttributes)
    ]);
};

const updateAt = async (
    id,
    { name },
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES
) => {
    await ModelService.update(At, { id }, { name });

    return await ModelService.getById(At, id, atAttributes, [
        atVersionAssociation(atVersionAttributes),
        atModeAssociation(atModeAttributes)
    ]);
};

const removeAt = async (id, deleteOptions = { truncate: false }) => {
    return await ModelService.removeById(At, id, deleteOptions);
};

// AtVersion

const getAtVersionByQuery = async (
    { at, version },
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES
) => {
    return ModelService.getByQuery(
        AtVersion,
        { at, version },
        atVersionAttributes,
        [atAssociation(atAttributes)]
    );
};

const getAtVersions = async (
    search,
    filter = {},
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, version: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        AtVersion,
        where,
        atVersionAttributes,
        [atAssociation(atAttributes)],
        pagination
    );
};

const createAtVersion = async (
    { at, version },
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES
) => {
    await ModelService.create(AtVersion, { at, version });

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getByQuery(
        AtVersion,
        { at, version },
        atVersionAttributes,
        [atAssociation(atAttributes)]
    );
};

const updateAtVersionByQuery = async (
    id,
    { at, version },
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES
) => {
    await ModelService.update(AtVersion, { at, version }, { version });

    return await ModelService.getByQuery(
        AtVersion,
        { at, version },
        atVersionAttributes,
        [atAssociation(atAttributes)]
    );
};

const removeAtVersionByQuery = async (
    { at, version },
    deleteOptions = { truncate: false }
) => {
    return await ModelService.removeById(
        AtVersion,
        { at, version },
        deleteOptions
    );
};

// AtMode

const getAtModeByQuery = async (
    { at, mode },
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES
) => {
    return ModelService.getByQuery(AtMode, { at, mode }, atModeAttributes, [
        atAssociation(atAttributes)
    ]);
};

const getAtModes = async (
    search,
    filter = {},
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, mode: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        AtMode,
        where,
        atModeAttributes,
        [atAssociation(atAttributes)],
        pagination
    );
};

const createAtMode = async (
    { at, mode },
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES
) => {
    await ModelService.create(AtMode, { at, mode });

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getByQuery(
        AtMode,
        { at, mode },
        atModeAttributes,
        [atAssociation(atAttributes)]
    );
};

const updateAtModeByQuery = async (
    id,
    { at, mode },
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES
) => {
    await ModelService.update(AtMode, { at, mode }, { mode });

    return await ModelService.getByQuery(
        AtMode,
        { at, mode },
        atModeAttributes,
        [atAssociation(atAttributes)]
    );
};

const removeAtModeByQuery = async (
    { at, mode },
    deleteOptions = { truncate: false }
) => {
    return await ModelService.removeById(AtMode, { at, mode }, deleteOptions);
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
    removeAtModeByQuery,

    // Constants
    AT_ATTRIBUTES,
    AT_VERSION_ATTRIBUTES,
    AT_MODE_ATTRIBUTES
};
