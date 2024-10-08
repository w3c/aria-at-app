const ModelService = require('./ModelService');
const {
  USER_ATTRIBUTES,
  ROLE_ATTRIBUTES,
  USER_ROLES_ATTRIBUTES,
  TEST_PLAN_RUN_ATTRIBUTES,
  AT_ATTRIBUTES,
  USER_ATS_ATTRIBUTES
} = require('./helpers');
const { Sequelize, User, UserRoles, UserAts } = require('../');
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
 * @param atAttributes - Role attributes
 * @returns {{association: string, attributes: string[], through: {attributes: string[]}}}
 */
const atAssociation = atAttributes => ({
  association: 'ats',
  attributes: atAttributes,
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
 * @param vendorAttributes - Vendor attributes
 * @returns {{association: string, attributes: string[]}}
 */
const vendorAssociation = vendorAttributes => ({
  association: 'company',
  attributes: vendorAttributes
});

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} options
 * @param {number} options.id - id of User to be retrieved
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {string[]} options.roleAttributes - Role attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getUserById = async ({
  id,
  userAttributes = USER_ATTRIBUTES,
  roleAttributes = ROLE_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
  vendorAttributes = [],
  includeVendorAts = false,
  transaction
}) => {
  const include = [
    roleAssociation(roleAttributes),
    atAssociation(atAttributes),
    testPlanRunAssociation(testPlanRunAttributes)
  ];

  if (vendorAttributes.length > 0) {
    const vendorInclude = vendorAssociation(vendorAttributes);
    if (includeVendorAts) {
      vendorInclude.include = [
        {
          association: 'ats',
          attributes: atAttributes
        }
      ];
    }
    include.push(vendorInclude);
  }

  return ModelService.getById(User, {
    id,
    attributes: userAttributes,
    include,
    transaction
  });
};

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} options
 * @param {string} options.username - username of User to be retrieved
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {string[]} options.roleAttributes - Role attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getUserByUsername = async ({
  username,
  userAttributes = USER_ATTRIBUTES,
  roleAttributes = ROLE_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
  vendorAttributes = [],
  transaction
}) => {
  return ModelService.getByQuery(User, {
    where: { username },
    attributes: userAttributes,
    include: [
      roleAssociation(roleAttributes),
      atAssociation(atAttributes),
      testPlanRunAssociation(testPlanRunAttributes),
      vendorAssociation(vendorAttributes)
    ],
    transaction
  });
};

/**
 * @param {object} options
 * @param {string|any} options.search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {string[]} options.roleAttributes - Role attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} options.pagination.limit - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} options.pagination.order expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getUsers = async ({
  search,
  where = {}, // pass to 'where' for top level User object
  userAttributes = USER_ATTRIBUTES,
  roleAttributes = ROLE_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
  vendorAttributes = [],
  pagination = {},
  transaction
}) => {
  // search and filtering options
  const searchQuery = search ? `%${search}%` : '';
  if (searchQuery) {
    where = { ...where, username: { [Op.iLike]: searchQuery } };
  }

  return ModelService.get(User, {
    where,
    attributes: userAttributes,
    include: [
      roleAssociation(roleAttributes),
      atAssociation(atAttributes),
      testPlanRunAssociation(testPlanRunAttributes),
      vendorAssociation(vendorAttributes)
    ],
    pagination,
    transaction
  });
};

/**
 */
const getBotUserByAtId = async ({
  atId,
  userAttributes = USER_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  transaction
}) => {
  return ModelService.getByQuery(User, {
    where: { isBot: true },
    attributes: userAttributes,
    include: [
      {
        ...atAssociation(atAttributes),
        where: { id: atId }
      }
    ],
    transaction
  });
};

/**
 * @param {object} options
 * @param {string|any} options.search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.userRolesAttributes - UserRoles attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} options.pagination.limit - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} options.pagination.order- expects a Sequelize structured input dataset for sorting the Sequelize Model results
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getUserRoles = async ({
  search,
  where = {},
  userRolesAttributes = USER_ROLES_ATTRIBUTES,
  pagination = {},
  transaction
}) => {
  if (search) throw new Error('Not implemented');

  return ModelService.get(UserRoles, {
    where,
    attributes: userRolesAttributes,
    include: [],
    pagination,
    transaction
  });
};

/**
 * @param {object} options
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} userAtsAttributes - UserAts attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} pagination.page - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} pagination.limit - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} pagination.order- expects a Sequelize structured input dataset for sorting the Sequelize Model results
 * @param {boolean} pagination.enablePagination - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getUserAts = async ({
  search,
  where = {},
  userAtsAttributes = USER_ATS_ATTRIBUTES,
  pagination = {},
  transaction
}) => {
  if (search) throw new Error('Not implemented');

  return ModelService.get(UserAts, {
    where,
    attributes: userAtsAttributes,
    include: [],
    pagination,
    transaction
  });
};

/**
 * @param {object} options
 * @param {object} options.values - values to be used to create the User (+ UserRole entry if applicable)
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {string[]} options.roleAttributes - Role attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createUser = async ({
  values: { username },
  userAttributes = USER_ATTRIBUTES,
  roleAttributes = ROLE_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
  vendorAttributes = [],
  transaction
}) => {
  const userResult = await ModelService.create(User, {
    values: { username },
    transaction
  });
  const { id } = userResult;

  // to ensure the structure being returned matches what we expect for simple queries and can be controlled
  return ModelService.getById(User, {
    id,
    attributes: userAttributes,
    include: [
      roleAssociation(roleAttributes),
      atAssociation(atAttributes),
      testPlanRunAssociation(testPlanRunAttributes),
      vendorAssociation(vendorAttributes)
    ],
    transaction
  });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the User record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {string[]} options.roleAttributes - Role attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateUserById = async ({
  id,
  values: { username },
  userAttributes = USER_ATTRIBUTES,
  roleAttributes = ROLE_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
  vendorAttributes = [],
  transaction
}) => {
  await ModelService.update(User, {
    where: { id },
    values: { username },
    transaction
  });

  return ModelService.getById(User, {
    id,
    attributes: userAttributes,
    include: [
      roleAssociation(roleAttributes),
      atAssociation(atAttributes),
      testPlanRunAssociation(testPlanRunAttributes),
      vendorAssociation(vendorAttributes)
    ],
    transaction
  });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the User record to be removed
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeUserById = async ({ id, truncate = false, transaction }) => {
  return ModelService.removeById(User, { id, truncate, transaction });
};

/**
 * Confirms the user roles are correct and replaces them if not.
 * @example
 * await bulkGetOrReplaceUserRoles({
 *     where: { userId: 1 },
 *     values: [{ roleName: 'TESTER' }, { roleName: 'ADMIN' }],
 *     userRolesAttributes: ['roleName'],
 *     transaction
 * });
 *
 * @param {object} where - values to be used to search Sequelize Model. Only supports exact values.
 * @param {object} valuesList - array of objects containing a "roleName"
 * @param {string[]} userRolesAttributes - UserRoles attributes to be returned in the result
 * @param {object} options - Generic options for Sequelize
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const bulkGetOrReplaceUserRoles = async ({
  where: { userId },
  valuesList,
  userRolesAttributes,
  transaction
}) => {
  const isUpdated = await ModelService.bulkGetOrReplace(UserRoles, {
    where: { userId },
    valuesList,
    transaction
  });

  const records = await getUserRoles({
    where: { userId },
    attributes: userRolesAttributes,
    transaction
  });

  return [records, isUpdated];
};

/**
 * Confirms the user's ATs are correct and replaces them if not.
 * @example
 * await bulkGetOrReplaceUserAts({
 *   where: { userId: 1 },
 *   valuesList: [{ atId: 1 }, { atId: 2 }],
 *   userAtsAttributes: ['atId'],
 *   transaction
 * });
 *
 * @param {object} options
 * @param {object} options.where - values to be used to search Sequelize Model. Only supports exact values.
 * @param {object} options.valuesList - array of objects containing an "atId"
 * @param {string[]} options.userAtsAttributes - UserAts attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const bulkGetOrReplaceUserAts = async ({
  where: { userId },
  valuesList,
  userAtsAttributes,
  transaction
}) => {
  const isUpdated = await ModelService.bulkGetOrReplace(UserAts, {
    where: { userId },
    valuesList,
    transaction
  });

  const records = await getUserAts({
    where: { userId },
    userAtsAttributes,
    transaction
  });

  return [records, isUpdated];
};

/**
 * Gets one user, creating them if they do not exist, including their roles.
 * @param {object} options
 * @param {*} options.where - These values will be used to find a matching record, or they will be used to create one
 * @param {*} options.values - Values which will be used when a record is found or created, but not used for the initial find
 * @param {string[]} options.userAttributes - User attributes to be returned in the result
 * @param {string[]} options.roleAttributes - Role attributes to be returned in the result
 * @param {string[]} options.atAttributes - AT attributes to be returned in the result
 * @param {string[]} options.testPlanRunAttributes - TestPlanRun attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<[*, boolean]>}
 */
const getOrCreateUser = async ({
  where: { username },
  values: { roles },
  userAttributes = USER_ATTRIBUTES,
  roleAttributes = ROLE_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  testPlanRunAttributes = TEST_PLAN_RUN_ATTRIBUTES,
  vendorAttributes = [],
  transaction
}) => {
  const accumulatedResults = await ModelService.nestedGetOrCreate({
    operations: [
      {
        get: getUsers,
        create: createUser,
        values: { username },
        returnAttributes: {}
      },
      accumulatedResults => {
        const userId = accumulatedResults[0][0].id;
        return {
          bulkGetOrReplace: bulkGetOrReplaceUserRoles,
          bulkGetOrReplaceWhere: { userId },
          valuesList: roles.map(({ name }) => ({ roleName: name })),
          returnAttributes: {}
        };
      }
    ],
    transaction
  });

  const userId = accumulatedResults[0][0].id;
  const isNewUser = accumulatedResults[0][1];
  const user = await getUserById({
    id: userId,
    userAttributes,
    roleAttributes,
    atAttributes,
    testPlanRunAttributes,
    vendorAttributes,
    transaction
  });

  return [user, isNewUser];
};

// Custom Functions

/**
 * This assumes the id (userId) and the role (roleName) are valid entries that already exist
 * @param {number} id - id of the User that the role will be added for
 * @param {string} role - role to be assigned to the User record referenced by {@param id}
 * @param {object} options
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const addUserRole = async (id, role, { transaction }) => {
  return ModelService.create(UserRoles, {
    values: { userId: id, roleName: role },
    transaction
  });
};

/**
 * @param {number} userId - id of the User that the role will be removed from
 * @param {string} roleName - role to be removed for the User record referenced by {@param id}
 * @param {object} options
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeUserRole = async (userId, roleName, { transaction }) => {
  return ModelService.removeByQuery(UserRoles, {
    where: { userId, roleName },
    transaction
  });
};

/**
 * @param {number} userId - id of the User that the vendor will be added to
 * @param {number} vendorId - id of the Vendor that the User will be associated with
 * @param {object} options
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const addUserVendor = async (userId, vendorId, { transaction }) => {
  // Set the company Vendor association for the user
  return ModelService.update(User, {
    where: { id: userId },
    values: { vendorId },
    transaction
  });
};

module.exports = {
  // Basic CRUD
  getUserById,
  getUserByUsername,
  getUsers,
  getBotUserByAtId,
  getUserRoles,
  getUserAts,
  createUser,
  updateUserById,
  removeUserById,
  bulkGetOrReplaceUserRoles,
  bulkGetOrReplaceUserAts,
  getOrCreateUser,

  // Custom Functions
  addUserRole,
  removeUserRole,
  addUserVendor
};
