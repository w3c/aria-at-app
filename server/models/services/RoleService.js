const ModelService = require('./ModelService');
const { ROLE_ATTRIBUTES, USER_ATTRIBUTES } = require('./helpers');
const { Sequelize, Role } = require('../');
const { Op } = Sequelize;

// association helpers to be included with Models' results

/**
 * @param userAttributes - Role attributes
 * @returns {{association: string, attributes: string[], through: {attributes: string[]}}}
 */
const userAssociation = userAttributes => ({
    association: 'users',
    attributes: userAttributes,
    through: { attributes: [] }
});

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} options
 * @param {string} options.name - name of Role to be retrieved
 * @param {string[]} options.roleAttributes - Role attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const getRoleByName = async ({
    name,
    roleAttributes = ROLE_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    t
}) => {
    return ModelService.getByQuery(Role, {
        where: { name },
        attributes: roleAttributes,
        include: [userAssociation(userAttributes)],
        t
    });
};

/**
 * @param {object} options
 * @param {string|any} options.search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.roleAttributes - Role attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} options.pagination.limit - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} options.pagination.order- expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const getRoles = async ({
    search,
    where = {},
    roleAttributes = ROLE_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    pagination = {},
    t
}) => {
    // search and filtering options
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return ModelService.get(Role, {
        where,
        attributes: roleAttributes,
        include: [userAssociation(userAttributes)],
        pagination,
        t
    });
};

/**
 * @param {object} options
 * @param {object} values - values to be used to create the Role
 * @param {string[]} roleAttributes - Role attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const createRole = async ({
    values: { name },
    roleAttributes = ROLE_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    t
}) => {
    const role = await ModelService.create(Role, { values: { name }, t });
    const { name: createdName } = role; // in case some Postgres function is ever written to modify the the name value on insert

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return getRoleByName({
        name: createdName,
        roleAttributes,
        userAttributes,
        t
    });
};

/**
 * @param {object} options
 * @param {string} options.name - name of the Role record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} options.roleAttributes - Role attributes to be returned in the result
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateRoleByName = async ({
    name,
    values = {},
    roleAttributes = ROLE_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    t
}) => {
    await ModelService.update(Role, { where: { name }, values, t });
    const { name: updatedName } = values;

    return getRoleByName({
        name: updatedName || name,
        roleAttributes,
        userAttributes,
        t
    });
};

/**
 * @param {object} options
 * @param {string} options.name - name of the Role record to be removed
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.t - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeRoleByName = async ({ name, truncate = false, t }) => {
    return ModelService.removeByQuery(Role, {
        where: { name },
        truncate,
        t
    });
};

module.exports = {
    // Basic CRUD
    getRoleByName,
    getRoles,
    createRole,
    updateRoleByName,
    removeRoleByName
};
