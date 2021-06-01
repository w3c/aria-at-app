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
 * @param {string} name - name of Role to be retrieved
 * @param {string[]} roleAttributes - Role attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @returns {Promise<*>}
 */
const getRoleByName = async (
    name,
    roleAttributes = ROLE_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    return await ModelService.getByQuery(Role, { name }, roleAttributes, [
        userAssociation(userAttributes)
    ]);
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} roleAttributes - Role attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @returns {Promise<*>}
 */
const getRoles = async (
    search,
    filter = {}, // pass to 'where' for top level Role object
    roleAttributes = ROLE_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        Role,
        where,
        roleAttributes,
        [userAssociation(userAttributes)],
        pagination
    );
};

/**
 * @param {object} createParams - values to be used to create the Role
 * @param {string[]} roleAttributes - Role attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @returns {Promise<*>}
 */
const createRole = async (
    { name },
    roleAttributes = ROLE_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    const role = await ModelService.create(Role, { name });
    const { name: createdName } = role; // in case some Postgres function is ever written to modify the the name value on insert

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await getRoleByName(createdName, roleAttributes, userAttributes);
};

/**
 * @param {string} name - name of the Role record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} roleAttributes - Role attributes to be returned in the result
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @returns {Promise<*>}
 */
const updateRole = async (
    name,
    updateParams = {},
    roleAttributes = ROLE_ATTRIBUTES,
    userAttributes = USER_ATTRIBUTES
) => {
    await ModelService.update(Role, { name }, updateParams);
    const { name: updatedName } = updateParams;

    return await getRoleByName(
        updatedName || name,
        roleAttributes,
        userAttributes
    );
};

/**
 * @param {string} name - name of the Role record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeRole = async (name, deleteOptions) => {
    return await ModelService.removeByQuery(Role, { name }, deleteOptions);
};

module.exports = {
    // Basic CRUD
    getRoleByName,
    getRoles,
    createRole,
    updateRole,
    removeRole
};
