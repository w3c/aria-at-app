const ModelService = require('./ModelService');
const { Assertion, AssertionAtBug } = require('../');
const { ASSERTION_ATTRIBUTES } = require('./helpers');

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

/**
 * Links multiple AtBugs to an Assertion
 * @param {object} options
 * @param {number} options.assertionId - The assertion ID
 * @param {number[]} options.atBugIds - Array of AtBug IDs to link
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} Updated Assertion with atBugs
 */
const linkAtBugsToAssertion = async ({
  assertionId,
  atBugIds,
  commandId,
  transaction
}) => {
  const assertion = await ModelService.findByPk(Assertion, {
    id: assertionId,
    transaction
  });
  if (!assertion) {
    throw new Error(`Assertion with id ${assertionId} not found`);
  }

  // Normalize IDs and avoid duplicates by checking existing links first
  const numericBugIds = Array.from(
    new Set(
      (atBugIds || []).map(id => Number(id)).filter(id => !Number.isNaN(id))
    )
  );
  if (numericBugIds.length === 0) {
    return await ModelService.findByPk(Assertion, {
      id: assertionId,
      include: [{ association: 'atBugs' }],
      transaction
    });
  }

  // Get existing links for this assertion and commandId combination
  const whereClause = { assertionId };
  if (commandId) {
    whereClause.commandId = commandId;
  }
  const existing = await AssertionAtBug.findAll({
    where: whereClause,
    attributes: ['atBugId'],
    transaction
  });
  const existingIds = new Set(existing.map(r => r.atBugId));
  const toAdd = numericBugIds.filter(id => !existingIds.has(id));

  if (toAdd.length) {
    try {
      // Bulk create with commandId
      await AssertionAtBug.bulkCreate(
        toAdd.map(atBugId => ({
          assertionId,
          atBugId,
          commandId
        })),
        { transaction }
      );
    } catch (e) {
      // Ignore duplicate link errors that may occur under concurrent requests
    }
  }

  // Return the assertion with its bugs
  return await ModelService.findByPk(Assertion, {
    id: assertionId,
    include: [
      {
        association: 'atBugs',
        include: [{ association: 'at' }]
      }
    ],
    transaction
  });
};

/**
 * Unlinks specific AtBugs from an Assertion
 * @param {object} options
 * @param {number} options.assertionId - The assertion ID
 * @param {number[]} options.atBugIds - Array of AtBug IDs to unlink
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} Updated Assertion with atBugs
 */
const unlinkAtBugsFromAssertion = async ({
  assertionId,
  atBugIds,
  commandId,
  transaction
}) => {
  const assertion = await ModelService.findByPk(Assertion, {
    id: assertionId,
    transaction
  });
  if (!assertion) {
    throw new Error(`Assertion with id ${assertionId} not found`);
  }

  const numericBugIds = Array.from(
    new Set(
      (atBugIds || []).map(id => Number(id)).filter(id => !Number.isNaN(id))
    )
  );
  if (numericBugIds.length) {
    // Delete directly from AssertionAtBug table with commandId filter
    const whereClause = {
      assertionId,
      atBugId: numericBugIds
    };
    if (commandId) {
      whereClause.commandId = commandId;
    }
    await AssertionAtBug.destroy({
      where: whereClause,
      transaction
    });
  }

  // Return the assertion with its bugs
  return await ModelService.findByPk(Assertion, {
    id: assertionId,
    include: [
      {
        association: 'atBugs',
        include: [{ association: 'at' }]
      }
    ],
    transaction
  });
};

/**
 * Unlinks all AtBugs from an Assertion
 * @param {object} options
 * @param {number} options.assertionId - The assertion ID
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} Updated Assertion with atBugs
 */
const unlinkAllAtBugsFromAssertion = async ({ assertionId, transaction }) => {
  await AssertionAtBug.destroy({
    where: { assertionId },
    transaction
  });

  return await ModelService.findByPk(Assertion, {
    id: assertionId,
    include: [{ association: 'atBugs' }],
    transaction
  });
};

/**
 * Gets all Assertions linked to a specific AtBug
 * @param {object} options
 * @param {number} options.atBugId - The AtBug ID
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*[]>} Assertions
 */
const getAssertionsByAtBugId = async ({ atBugId, transaction }) => {
  const links = await AssertionAtBug.findAll({
    where: { atBugId },
    transaction
  });

  const assertionIds = links.map(link => link.assertionId);

  return await ModelService.get(Assertion, {
    where: { id: assertionIds },
    attributes: ASSERTION_ATTRIBUTES,
    transaction
  });
};

module.exports = {
  getAssertionById,
  getAssertions,
  getAssertionByEncodedId,
  getAssertionsByTestPlanVersionId,
  getAssertionsByTestId,
  createAssertion,
  bulkCreateAssertions,
  updateAssertionById,
  deleteAssertionById,
  linkAtBugsToAssertion,
  unlinkAtBugsFromAssertion,
  unlinkAllAtBugsFromAssertion,
  getAssertionsByAtBugId
};
