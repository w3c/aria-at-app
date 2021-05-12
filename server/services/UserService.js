const { Sequelize, User, Role, UserRoles, TestPlanRun } = require('../models');
const { Op } = Sequelize;

// default attributes to be returned for models and related associations
const USER_ATTRIBUTES = ['id', 'username', 'createdAt', 'updatedAt'];
const ROLE_ATTRIBUTES = ['name'];
const TEST_PLAN_RUN_ATTRIBUTES = [
    'id',
    'isManuallyTested',
    'tester',
    'testPlanReport'
];

// association helpers to be included with User Models' results
const roleAssociation = roleAttributes => ({
    model: Role,
    as: 'roles',
    attributes: roleAttributes,
    through: { attributes: [] }
});

const testPlanAssociation = testPlanRunAttributes => ({
    model: TestPlanRun,
    as: 'testPlanRuns',
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
    // findByPk
    return await User.findOne({
        where: { id },
        attributes: userAttributes,
        include: [
            roleAssociation(roleAttributes),
            testPlanAssociation(testPlanRunAttributes)
        ]
    });
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
    return await User.findOne({
        where: { username },
        attributes: userAttributes,
        include: [
            roleAssociation(roleAttributes),
            testPlanAssociation(testPlanRunAttributes)
        ]
    });
};

/**
 * @param search
 // * @param pagination
 * @param filter
 * @param userAttributes
 * @param roleAttributes
 * @param testPlanRunAttributes
 * @returns {Promise<*>}
 */
const getUsers = async (
    search,
    // pagination = {},
    filter = {}, // pass to 'where' for top level User object
    userAttributes = USER_ATTRIBUTES,
    roleAttributes = ROLE_ATTRIBUTES,
    testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery)
        where = { ...where, username: { [Op.iLike]: searchQuery } };

    // pagination and sorting options
    // let { page = 0, limit = 10, order = [], enable = false } = pagination; // page 0->1, 1->2; manage through middleware
    // // 'order' eg. [ [ 'username', 'DESC' ], [..., ...], ... ]
    // if (page < 0) page = 0;
    // if (limit < 0 || !enable) limit = null;
    // const offset = limit < 0 ? 0 : page * limit; // skip (1 * 10 results) = 10 to get get to page 2

    return await User.findAll({
        where,
        // limit,
        // offset,
        // order,
        attributes: userAttributes,
        include: [
            roleAssociation(roleAttributes),
            testPlanAssociation(testPlanRunAttributes)
        ]
    });
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
    userAttributes,
    roleAttributes,
    testPlanRunAttributes
) => {
    const userResult = await User.create({ username });
    const { id } = userResult;

    if (role) await UserRoles.create({ userId: id, roleName: role });

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await getUserById(
        id,
        userAttributes,
        roleAttributes,
        testPlanRunAttributes
    );
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
    userAttributes,
    roleAttributes,
    testPlanRunAttributes
) => {
    await User.update({ username }, { where: { id } });

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await getUserById(
        id,
        userAttributes,
        roleAttributes,
        testPlanRunAttributes
    );
};

/**
 * @param id
 * @param deleteOptions
 * @returns {Promise<boolean>}
 */
const removeUser = async (id, deleteOptions = { truncate: false }) => {
    const { truncate } = deleteOptions;
    await User.destroy({
        where: { id },
        truncate
    });
    return true;
};

module.exports = {
    getUserById,
    getUserByUsername,
    getUsers,
    createUser,
    updateUser,
    removeUser,

    USER_ATTRIBUTES,
    ROLE_ATTRIBUTES,
    TEST_PLAN_RUN_ATTRIBUTES
};
