const ModelService = require('./ModelService');
const {
    USER_ATTRIBUTES,
    ROLE_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES
} = require('./helpers');
const { Sequelize, User, UserRoles } = require('../models');
const { Op } = Sequelize;

// Section :- association helpers to be included with Models' results
const roleAssociation = roleAttributes => ({
    association: 'roles',
    attributes: roleAttributes,
    through: { attributes: [] }
});

const testPlanRunAssociation = testPlanRunAttributes => ({
    association: 'testPlanRuns',
    attributes: testPlanRunAttributes
});

/**
 * NB. Pass @param {roleAttributes} or @param {testPlanRunAttributes} as '[]' to exclude that related association
 * @param {number} id - ID of user to be retrieved
 * @param {string[]} userAttributes
 * @param {string[]} roleAttributes
 * @param {string[]} testPlanRunAttributes
 * @returns {Promise<void>}
 */
const getUserById = async (
    id,
    userAttributes = USER_ATTRIBUTES,
    roleAttributes = ROLE_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES
) => {
    return await ModelService.getById(User, id, userAttributes, [
        roleAssociation(roleAttributes),
        testPlanRunAssociation(testPlanRunAttributes)
    ]);
};

/**
 * NB. Pass @param {roleAttributes} or @param {testPlanRunAttributes} as '[]' to exclude that related association
 * @param {string} username - username of user to be retrieved
 * @param {string[]} userAttributes
 * @param {string[]} roleAttributes
 * @param {string[]} testPlanRunAttributes
 * @returns {Promise<void>}
 */
const getUserByUsername = async (
    username,
    userAttributes = USER_ATTRIBUTES,
    roleAttributes = ROLE_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES
) => {
    return await ModelService.getByQuery(User, { username }, userAttributes, [
        roleAssociation(roleAttributes),
        testPlanRunAssociation(testPlanRunAttributes)
    ]);
};

/**
 * @param search
 * @param filter
 * @param userAttributes
 * @param roleAttributes
 * @param testPlanRunAttributes
 * @param pagination
 * @returns {Promise<*>}
 */
const getUsers = async (
    search,
    filter = {}, // pass to 'where' for top level User object
    userAttributes = USER_ATTRIBUTES,
    roleAttributes = ROLE_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
    pagination = {}
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
        pagination
    );
};

/**
 * @param createParams
 * @param userAttributes
 * @param roleAttributes
 * @param testPlanRunAttributes
 * @returns {Promise<void>}
 */
const createUser = async (
    { username, role },
    userAttributes = USER_ATTRIBUTES,
    roleAttributes = ROLE_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES
) => {
    const userResult = await ModelService.create(User, { username });
    const { id } = userResult;

    // eslint-disable-next-line no-use-before-define
    if (role) await addUserToRole(id, role);

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getById(User, id, userAttributes, [
        roleAssociation(roleAttributes),
        testPlanRunAssociation(testPlanRunAttributes)
    ]);
};

/**
 * @param id
 * @param updateParams
 * @param userAttributes
 * @param roleAttributes
 * @param testPlanRunAttributes
 * @returns {Promise<void>}
 */
const updateUser = async (
    id,
    { username },
    userAttributes = USER_ATTRIBUTES,
    roleAttributes = ROLE_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES
) => {
    await ModelService.update(User, { id }, { username });

    return await ModelService.getById(User, id, userAttributes, [
        roleAssociation(roleAttributes),
        testPlanRunAssociation(testPlanRunAttributes)
    ]);
};

/**
 * @param id
 * @param deleteOptions
 * @returns {Promise<boolean>}
 */
const removeUser = async (id, deleteOptions = { truncate: false }) => {
    return await ModelService.removeById(User, id, deleteOptions);
};

/**
 * @link {https://sequelize.org/v5/manual/raw-queries.html} for related documentation in case of expanding
 * @param query
 * @returns {Promise<*>}
 */
const rawQuery = async query => {
    return await ModelService.rawQuery(query);
};

// Section :- Custom Functions

/**
 * This assumes the id (userId) and the role (roleName) are valid entries that already exist
 * @param id
 * @param role
 * @returns {Promise<*>}
 */
const addUserToRole = async (id, role) => {
    return await ModelService.create(UserRoles, { userId: id, roleName: role });
};

/**
 *
 * @param id
 * @param role
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
    rawQuery,

    // Custom Functions
    addUserToRole,
    deleteUserFromRole,

    // Constants
    USER_ATTRIBUTES,
    ROLE_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES
};
