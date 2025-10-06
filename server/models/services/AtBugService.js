const ModelService = require('./ModelService');
const { AtBug } = require('../');

// Default attributes to select for AtBug queries
const AT_BUG_ATTRIBUTES = [
  'id',
  'title',
  'bugId',
  'url',
  'atId',
  'createdAt',
  'updatedAt'
];

// Association helper for Assertions
const assertionsAssociation = assertionAttributes => ({
  association: 'assertions',
  attributes: assertionAttributes
});

/**
 * @param {object} options
 * @param {number} options.id - unique id of the AtBug being queried
 * @param {object} options.where - Sequelize where clause
 * @param {boolean} options.includeAssertions - whether to include associated assertions
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} AtBug
 */
const getAtBugById = async ({
  id,
  where,
  includeAssertions = false,
  transaction
}) => {
  const include = [];
  if (includeAssertions) {
    include.push(assertionsAssociation([]));
  }

  return await ModelService.getById(AtBug, {
    id,
    where,
    attributes: AT_BUG_ATTRIBUTES,
    include,
    transaction
  });
};

/**
 * @param {object} options
 * @param {object} options.where - Sequelize where clause
 * @param {boolean} options.includeAssertions - whether to include associated assertions
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*[]>} AtBugs
 */
const getAtBugs = async ({
  where,
  includeAssertions = false,
  transaction
} = {}) => {
  const include = [];
  if (includeAssertions) {
    include.push(assertionsAssociation([]));
  }

  return await ModelService.get(AtBug, {
    where,
    attributes: AT_BUG_ATTRIBUTES,
    include,
    transaction
  });
};

/**
 * @param {object} options
 * @param {number} options.atId - AT ID to filter by
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*[]>} AtBugs
 */
const getAtBugsByAtId = async ({ atId, transaction }) =>
  await ModelService.get(AtBug, {
    where: { atId },
    attributes: AT_BUG_ATTRIBUTES,
    transaction
  });

/**
 * @param {object} options
 * @param {object} options.values - atBug data
 * @param {string} options.values.title - Bug title
 * @param {string} options.values.bugId - Bug ID (string)
 * @param {string} options.values.url - Bug URL
 * @param {number} options.values.atId - AT ID
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} AtBug
 */
const createAtBug = async ({ values, transaction }) =>
  await ModelService.create(AtBug, {
    values,
    transaction
  });

/**
 * @param {object} options
 * @param {number} options.id - unique id of the AtBug being updated
 * @param {object} options.values - atBug data to update
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} AtBug
 */
const updateAtBugById = async ({ id, values, transaction }) =>
  await ModelService.update(AtBug, {
    where: { id },
    values,
    transaction
  });

/**
 * @param {object} options
 * @param {number} options.id - unique id of the AtBug model being removed
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<number>} Number of AtBugs deleted
 */
const deleteAtBugById = async ({ id, transaction }) =>
  await ModelService.removeById(AtBug, {
    id,
    transaction
  });

module.exports = {
  getAtBugById,
  getAtBugs,
  getAtBugsByAtId,
  createAtBug,
  updateAtBugById,
  deleteAtBugById
};
