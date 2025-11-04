const ModelService = require('./ModelService');
const { NegativeSideEffect, NegativeSideEffectAtBug } = require('../');
const { NEGATIVE_SIDE_EFFECT_ATTRIBUTES } = require('./helpers');

/**
 * @param {object} options
 * @param {number} options.id - unique id of the NegativeSideEffect being queried
 * @param {object} options.where - Sequelize where clause
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} NegativeSideEffect
 */
const getNegativeSideEffectById = async ({ id, where, transaction }) =>
  await ModelService.getById(NegativeSideEffect, {
    id,
    where,
    attributes: NEGATIVE_SIDE_EFFECT_ATTRIBUTES,
    transaction
  });

/**
 * @param {object} options
 * @param {object} options.where - Sequelize where clause
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*[]>} NegativeSideEffects
 */
const getNegativeSideEffects = async ({ where, transaction } = {}) =>
  await ModelService.get(NegativeSideEffect, {
    where,
    attributes: NEGATIVE_SIDE_EFFECT_ATTRIBUTES,
    transaction
  });

/**
 * @param {object} options
 * @param {number} options.testPlanRunId - TestPlanRun ID
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*[]>} NegativeSideEffects
 */
const getNegativeSideEffectsByTestPlanRunId = async ({
  testPlanRunId,
  transaction
}) => {
  // Return empty array if testPlanRunId is invalid
  if (!testPlanRunId || typeof testPlanRunId !== 'number') {
    return [];
  }

  return await ModelService.get(NegativeSideEffect, {
    where: { testPlanRunId },
    attributes: NEGATIVE_SIDE_EFFECT_ATTRIBUTES,
    include: [{ association: 'atBugs' }],
    transaction
  });
};

/**
 * @param {object} options
 * @param {number} options.testResultId - TestResult ID
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*[]>} NegativeSideEffects
 */
const getNegativeSideEffectsByTestResultId = async ({
  testResultId,
  transaction
}) =>
  await ModelService.get(NegativeSideEffect, {
    where: { testResultId },
    attributes: NEGATIVE_SIDE_EFFECT_ATTRIBUTES,
    transaction
  });

/**
 * @param {object} options
 * @param {number} options.scenarioResultId - ScenarioResult ID
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*[]>} NegativeSideEffects
 */
const getNegativeSideEffectsByScenarioResultId = async ({
  scenarioResultId,
  transaction
}) =>
  await ModelService.get(NegativeSideEffect, {
    where: { scenarioResultId },
    attributes: NEGATIVE_SIDE_EFFECT_ATTRIBUTES,
    transaction
  });

/**
 * @param {object} options
 * @param {string} options.negativeSideEffectId - The negative side effect ID from JSON
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*[]>} NegativeSideEffects
 */
const getNegativeSideEffectsByNegativeSideEffectId = async ({
  negativeSideEffectId,
  transaction
}) =>
  await ModelService.get(NegativeSideEffect, {
    where: { negativeSideEffectId },
    attributes: NEGATIVE_SIDE_EFFECT_ATTRIBUTES,
    transaction
  });

/**
 * @param {object} options
 * @param {string} options.encodedId - The encoded negative side effect ID
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} NegativeSideEffect
 */
const getNegativeSideEffectByEncodedId = async ({ encodedId, transaction }) => {
  const result = await ModelService.getByQuery(NegativeSideEffect, {
    where: { encodedId },
    attributes: NEGATIVE_SIDE_EFFECT_ATTRIBUTES,
    transaction
  });

  return result;
};

/**
 * @param {object} options
 * @param {object} options.values - negative side effect data
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} NegativeSideEffect
 */
const createNegativeSideEffect = async ({ values, transaction }) =>
  await ModelService.create(NegativeSideEffect, {
    values,
    transaction
  });

/**
 * Bulk create negative side effects for performance
 * @param {object} options
 * @param {object[]} options.negativeSideEffectsData - Array of negative side effect data objects
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*[]>} Created NegativeSideEffects
 */
const bulkCreateNegativeSideEffects = async ({
  negativeSideEffectsData,
  transaction
}) => {
  return await NegativeSideEffect.bulkCreate(negativeSideEffectsData, {
    transaction,
    returning: true
  });
};

/**
 * @param {object} options
 * @param {number} options.id - unique id of the NegativeSideEffect being updated
 * @param {object} options.values - negative side effect data to update
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} NegativeSideEffect
 */
const updateNegativeSideEffectById = async ({ id, values, transaction }) =>
  await ModelService.update(NegativeSideEffect, {
    where: { id },
    values,
    transaction
  });

/**
 * @param {object} options
 * @param {number} options.id - unique id of the NegativeSideEffect model being removed
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<number>} Number of NegativeSideEffects deleted
 */
const deleteNegativeSideEffectById = async ({ id, transaction }) =>
  await ModelService.removeById(NegativeSideEffect, {
    id,
    transaction
  });

/**
 * Links multiple AtBugs to a NegativeSideEffect
 * @param {object} options
 * @param {number} options.negativeSideEffectId - The negative side effect ID
 * @param {number[]} options.atBugIds - Array of AtBug IDs to link
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} Updated NegativeSideEffect with atBugs
 */
const linkAtBugsToNegativeSideEffect = async ({
  negativeSideEffectId,
  atBugIds,
  transaction
}) => {
  const negativeSideEffect = await ModelService.findByPk(NegativeSideEffect, {
    id: negativeSideEffectId,
    transaction
  });
  if (!negativeSideEffect) {
    throw new Error(
      `NegativeSideEffect with id ${negativeSideEffectId} not found`
    );
  }

  // Normalize IDs and avoid duplicates by checking existing links first
  const numericBugIds = Array.from(
    new Set(
      (atBugIds || []).map(id => Number(id)).filter(id => !Number.isNaN(id))
    )
  );
  if (numericBugIds.length === 0) {
    return await ModelService.findByPk(NegativeSideEffect, {
      id: negativeSideEffectId,
      include: [{ association: 'atBugs' }],
      transaction
    });
  }

  const existing = await negativeSideEffect.getAtBugs({
    attributes: ['id'],
    joinTableAttributes: [],
    transaction
  });
  const existingIds = new Set(existing.map(b => b.id));
  const toAdd = numericBugIds.filter(id => !existingIds.has(id));
  if (toAdd.length) {
    try {
      await negativeSideEffect.addAtBugs(toAdd, { transaction });
    } catch (e) {
      // Ignore duplicate link errors that may occur under concurrent requests
    }
  }

  // Return the negative side effect with its bugs
  return await ModelService.findByPk(NegativeSideEffect, {
    id: negativeSideEffectId,
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
 * Unlinks specific AtBugs from a NegativeSideEffect
 * @param {object} options
 * @param {number} options.negativeSideEffectId - The negative side effect ID
 * @param {number[]} options.atBugIds - Array of AtBug IDs to unlink
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} Updated NegativeSideEffect with atBugs
 */
const unlinkAtBugsFromNegativeSideEffect = async ({
  negativeSideEffectId,
  atBugIds,
  transaction
}) => {
  const negativeSideEffect = await ModelService.findByPk(NegativeSideEffect, {
    id: negativeSideEffectId,
    transaction
  });
  if (!negativeSideEffect) {
    throw new Error(
      `NegativeSideEffect with id ${negativeSideEffectId} not found`
    );
  }

  const numericBugIds = Array.from(
    new Set(
      (atBugIds || []).map(id => Number(id)).filter(id => !Number.isNaN(id))
    )
  );
  if (numericBugIds.length) {
    await negativeSideEffect.removeAtBugs(numericBugIds, { transaction });
  }

  // Return the negative side effect with its bugs
  return await ModelService.findByPk(NegativeSideEffect, {
    id: negativeSideEffectId,
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
 * Unlinks all AtBugs from a NegativeSideEffect
 * @param {object} options
 * @param {number} options.negativeSideEffectId - The negative side effect ID
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*>} Updated NegativeSideEffect with atBugs
 */
const unlinkAllAtBugsFromNegativeSideEffect = async ({
  negativeSideEffectId,
  transaction
}) => {
  await NegativeSideEffectAtBug.destroy({
    where: { negativeSideEffectId },
    transaction
  });

  return await ModelService.findByPk(NegativeSideEffect, {
    id: negativeSideEffectId,
    include: [{ association: 'atBugs' }],
    transaction
  });
};

/**
 * Gets all NegativeSideEffects linked to a specific AtBug
 * @param {object} options
 * @param {number} options.atBugId - The AtBug ID
 * @param {import('sequelize').Transaction} options.transaction - Sequelize transaction
 * @returns {Promise<*[]>} NegativeSideEffects
 */
const getNegativeSideEffectsByAtBugId = async ({ atBugId, transaction }) => {
  const links = await NegativeSideEffectAtBug.findAll({
    where: { atBugId },
    transaction
  });

  const negativeSideEffectIds = links.map(link => link.negativeSideEffectId);

  return await ModelService.get(NegativeSideEffect, {
    where: { id: negativeSideEffectIds },
    attributes: NEGATIVE_SIDE_EFFECT_ATTRIBUTES,
    transaction
  });
};

module.exports = {
  getNegativeSideEffectById,
  getNegativeSideEffects,
  getNegativeSideEffectsByTestPlanRunId,
  getNegativeSideEffectsByTestResultId,
  getNegativeSideEffectsByScenarioResultId,
  getNegativeSideEffectsByNegativeSideEffectId,
  getNegativeSideEffectByEncodedId,
  createNegativeSideEffect,
  bulkCreateNegativeSideEffects,
  updateNegativeSideEffectById,
  deleteNegativeSideEffectById,
  linkAtBugsToNegativeSideEffect,
  unlinkAtBugsFromNegativeSideEffect,
  unlinkAllAtBugsFromNegativeSideEffect,
  getNegativeSideEffectsByAtBugId
};
