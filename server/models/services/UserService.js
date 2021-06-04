const ModelService = require('./ModelService');
const {
    USER_ATTRIBUTES,
    ROLE_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES
} = require('./helpers');
const { Sequelize, User, UserRoles } = require('../');
const { Op } = Sequelize;

// association helpers to be included with Models' results

/**
 * @param roleAttributes - Role attributes
 * @returns {{association: string, attributes: string[], through: {attributes: string[]}}}
 */
const roleAssociation = roleAttributes => ({
    association: 'roles',
    attributes: roleAttributes,
    through: { attributes: [] }
});

/**
 * @param testPlanRunAttributes - TestPlanRun attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanRunAssociation = testPlanRunAttributes => ({
    association: 'testPlanRuns',
    attributes: testPlanRunAttributes
});

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {number} id - id of User to be retrieved
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {string[]} roleAttributes - Role attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {object} options - Generic options for sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getUserById = async (
    id,
    userAttributes = USER_ATTRIBUTES,
    roleAttributes = ROLE_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    options = {}
) => {
    return await ModelService.getById(
        User,
        id,
        userAttributes,
        [
            roleAssociation(roleAttributes),
            testPlanRunAssociation(testPlanRunAttributes)
        ],
        options
    );
};

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {string} username - username of User to be retrieved
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {string[]} roleAttributes - Role attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {object} options - Generic options for sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getUserByUsername = async (
    username,
    userAttributes = USER_ATTRIBUTES,
    roleAttributes = ROLE_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    options = {}
) => {
    return await ModelService.getByQuery(
        User,
        { username },
        userAttributes,
        [
            roleAssociation(roleAttributes),
            testPlanRunAssociation(testPlanRunAttributes)
        ],
        options
    );
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {string[]} roleAttributes - Role attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {object} options - Generic options for sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getUsers = async (
    search,
    filter = {}, // pass to 'where' for top level User object
    userAttributes = USER_ATTRIBUTES,
    roleAttributes = ROLE_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    pagination = {},
    options = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery)
        where = { ...where, username: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        User,
        where,
        userAttributes,
        [
            roleAssociation(roleAttributes),
            testPlanRunAssociation(testPlanRunAttributes)
        ],
        pagination,
        options
    );
};

/**
 * @param {object} createParams - values to be used to create the User (+ UserRole entry if applicable)
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {string[]} roleAttributes - Role attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {object} options - Generic options for sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createUser = async (
    { username, role },
    userAttributes = USER_ATTRIBUTES,
    roleAttributes = ROLE_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    options
) => {
    const userResult = await ModelService.create(User, { username }, options);
    const { id } = userResult;

    // eslint-disable-next-line no-use-before-define
    if (role) await addUserToRole(id, role); // if role was also passed, create UserRole entry

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getById(
        User,
        id,
        userAttributes,
        [
            roleAssociation(roleAttributes),
            testPlanRunAssociation(testPlanRunAttributes)
        ],
        options
    );
};

/**
 * @param {number} id - id of the User record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} userAttributes - User attributes to be returned in the result
 * @param {string[]} roleAttributes - Role attributes to be returned in the result
 * @param {string[]} testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {object} options - Generic options for sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateUser = async (
    id,
    { username },
    userAttributes = USER_ATTRIBUTES,
    roleAttributes = ROLE_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    options = {}
) => {
    await ModelService.update(User, { id }, { username });

    return await ModelService.getById(
        User,
        id,
        userAttributes,
        [
            roleAssociation(roleAttributes),
            testPlanRunAssociation(testPlanRunAttributes)
        ],
        options
    );
};

/**
 * @param {number} id - id of the User record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeUser = async (id, deleteOptions) => {
    return await ModelService.removeById(User, id, deleteOptions);
};

// Custom Functions

/**
 * This assumes the id (userId) and the role (roleName) are valid entries that already exist
 * @param {number} id - id of the User that the role will be added for
 * @param {string} role - role to be assigned to the User record referenced by {@param id}
 * @returns {Promise<*>}
 */
const addUserToRole = async (id, role) => {
    return await ModelService.create(UserRoles, { userId: id, roleName: role });
};

/**
 * @param {number} id - id of the User that the role will be removed from
 * @param {string} role - role to be removed for the User record referenced by {@param id}
 * @returns {Promise<boolean>}
 */
const deleteUserFromRole = async (id, role) => {
    return await ModelService.removeByQuery(UserRoles, {
        userId: id,
        roleName: role
    });
};

module.exports = {
    // Basic CRUD
    getUserById,
    getUserByUsername,
    getUsers,
    createUser,
    updateUser,
    removeUser,

    // Custom Functions
    addUserToRole,
    deleteUserFromRole
};
