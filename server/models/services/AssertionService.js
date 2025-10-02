const ModelService = require('./ModelService');
const { Assertion } = require('../');

// Default attributes to select for Assertion queries
const ASSERTION_ATTRIBUTES = [
  'id',
  'testPlanVersionId',
  'testId',
  'assertionIndex',
  'priority',
  'text',
  'rawAssertionId',
  'assertionStatement',
  'assertionPhrase',
  'assertionExceptions',
  'encodedId',
  'createdAt',
  'updatedAt'
];

/**
 * @param {object} options
 * @param {number} options.id - unique id of the Assertion being queried
 * @param {object} options.where - Sequelize where clause
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} Assertion
 */
const getAssertionById = async ({ id, where, transaction }) =>
  await ModelService.getById(Assertion, {
    id,
    where,
    attributes: ASSERTION_ATTRIBUTES,
    transaction
  });

/**
 * @param {object} options
 * @param {object} options.where - Sequelize where clause
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*[]>} Assertions
 */
const getAssertions = async ({ where, transaction } = {}) =>
  await ModelService.get(Assertion, {
    where,
    attributes: ASSERTION_ATTRIBUTES,
    transaction
  });

/**
 * @param {object} options
 * @param {string} options.encodedId - The encoded assertion ID
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} Assertion
 */
const getAssertionByEncodedId = async ({ encodedId, transaction }) =>
  await ModelService.getByQuery(Assertion, {
    where: { encodedId },
    attributes: ASSERTION_ATTRIBUTES,
    transaction
  });

/**
 * @param {object} options
 * @param {number} options.testPlanVersionId - TestPlanVersion ID
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*[]>} Assertions
 */
const getAssertionsByTestPlanVersionId = async ({
  testPlanVersionId,
  transaction
}) =>
  await ModelService.get(Assertion, {
    where: { testPlanVersionId },
    attributes: ASSERTION_ATTRIBUTES,
    transaction
  });

/**
 * @param {object} options
 * @param {string} options.testId - Test ID
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*[]>} Assertions
 */
const getAssertionsByTestId = async ({ testId, transaction }) =>
  await ModelService.get(Assertion, {
    where: { testId },
    attributes: ASSERTION_ATTRIBUTES,
    pagination: {
      order: [['assertionIndex', 'ASC']]
    },
    transaction
  });

/**
 * @param {object} options
 * @param {object} options.values - assertion data
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} Assertion
 */
const createAssertion = async ({ values, transaction }) =>
  await ModelService.create(Assertion, {
    values,
    transaction
  });

/**
 * Bulk create assertions for performance
 * @param {object} options
 * @param {object[]} options.assertionsData - Array of assertion data objects
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*[]>} Created Assertions
 */
const bulkCreateAssertions = async ({ assertionsData, transaction }) => {
  return await Assertion.bulkCreate(assertionsData, {
    transaction,
    returning: true
  });
};

/**
 * @param {object} options
 * @param {number} options.id - unique id of the Assertion being updated
 * @param {object} options.values - assertion data to update
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} Assertion
 */
const updateAssertionById = async ({ id, values, transaction }) =>
  await ModelService.update(Assertion, {
    where: { id },
    values,
    transaction
  });

/**
 * @param {object} options
 * @param {number} options.id - unique id of the Assertion model being removed
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<number>} Number of Assertions deleted
 */
const deleteAssertionById = async ({ id, transaction }) =>
  await ModelService.removeById(Assertion, {
    id,
    transaction
  });

module.exports = {
  getAssertionById,
  getAssertions,
  getAssertionByEncodedId,
  getAssertionsByTestPlanVersionId,
  getAssertionsByTestId,
  createAssertion,
  bulkCreateAssertions,
  updateAssertionById,
  deleteAssertionById
};
