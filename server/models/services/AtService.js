const ModelService = require('./ModelService');
const {
  AT_ATTRIBUTES,
  AT_VERSION_ATTRIBUTES,
  BROWSER_ATTRIBUTES
} = require('./helpers');
const { Sequelize, At } = require('../');
const { Op } = Sequelize;

// association helpers to be included with Models' results
/**
 * @param atVersionAttributes - AtVersion attributes
 * @returns {{association: string, attributes: string[]}}
 */
const atVersionAssociation = atVersionAttributes => ({
  association: 'atVersions',
  attributes: atVersionAttributes
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
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtById = async ({
  id,
  atAttributes = AT_ATTRIBUTES,
  atVersionAttributes = AT_VERSION_ATTRIBUTES,
  browserAttributes = BROWSER_ATTRIBUTES,
  transaction
}) => {
  return ModelService.getById(At, {
    id,
    attributes: atAttributes,
    include: [
      atVersionAssociation(atVersionAttributes),
      browserAssociation(browserAttributes)
    ],
    transaction
  });
};

/**
 * @param {object} options
 * @param {string|any} options.search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} options.pagination.limit - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} options.pagination.order - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAts = async ({
  search,
  where = {},
  atAttributes = AT_ATTRIBUTES,
  atVersionAttributes = AT_VERSION_ATTRIBUTES,
  browserAttributes = BROWSER_ATTRIBUTES,
  pagination = {},
  transaction
}) => {
  // search and filtering options
  const searchQuery = search ? `%${search}%` : '';
  if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

  return ModelService.get(At, {
    where,
    attributes: atAttributes,
    include: [
      atVersionAssociation(atVersionAttributes),
      browserAssociation(browserAttributes)
    ],
    pagination,
    transaction
  });
};

/**
 * @param {object} options
 * @param {object} options.values - values to be used to create the At record
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createAt = async ({
  values: { name, key },
  atAttributes = AT_ATTRIBUTES,
  atVersionAttributes = AT_VERSION_ATTRIBUTES,
  browserAttributes = BROWSER_ATTRIBUTES,
  transaction
}) => {
  const atResult = await ModelService.create(At, {
    values: { name, key },
    transaction
  });
  const { id } = atResult;

  // to ensure the structure being returned matches what we expect for simple queries and can be controlled
  return ModelService.getById(At, {
    id,
    attributes: atAttributes,
    include: [
      atVersionAssociation(atVersionAttributes),
      browserAssociation(browserAttributes)
    ],
    transaction
  });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the At record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.browserAttributes  - Browser attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateAtById = async ({
  id,
  values: { name },
  atAttributes = AT_ATTRIBUTES,
  atVersionAttributes = AT_VERSION_ATTRIBUTES,
  browserAttributes = BROWSER_ATTRIBUTES,
  transaction
}) => {
  await ModelService.update(At, {
    where: { id },
    values: { name },
    transaction
  });

  return ModelService.getById(At, {
    id,
    attributes: atAttributes,
    include: [
      atVersionAssociation(atVersionAttributes),
      browserAssociation(browserAttributes)
    ],
    transaction
  });
};

/**
 * @param {number} id - id of the At record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeAtById = async ({ id, truncate = false, transaction }) => {
  return ModelService.removeById(At, { id, truncate, transaction });
};

module.exports = {
  // Basic CRUD [At]
  getAtById,
  getAts,
  createAt,
  updateAtById,
  removeAtById
};
