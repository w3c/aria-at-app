const ModelService = require('./ModelService');
const { AtVersion } = require('..');
const { Op } = require('sequelize');
const { AT_VERSION_ATTRIBUTES, AT_ATTRIBUTES } = require('./helpers');
const {
  AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS
} = require('../../util/constants');
const { TestPlanReport } = require('..');

/**
 * @param atAttributes - At attributes to be returned in the result
 * @returns {{association: string, attributes: string[]}}
 */
const atAssociation = atAttributes => ({
  association: 'at',
  attributes: atAttributes
});

/**
 * @param {object} options
 * @param {string|any} options.search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} options.where - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {object} options.pagination - pagination options for query
 * @param {number} options.pagination.page - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} options.pagination.limit - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} options.pagination.order- expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} options.pagination.enablePagination - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtVersions = async ({
  search,
  where = {},
  atVersionAttributes = AT_VERSION_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  pagination = {},
  transaction
}) => {
  // search and filtering options
  const searchQuery = search ? `%${search}%` : '';
  if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

  return ModelService.get(AtVersion, {
    where,
    attributes: atVersionAttributes,
    include: [atAssociation(atAttributes)],
    pagination,
    transaction
  });
};

/**
 * Gets an AT version that meets the requirements for automation
 * @param {number} atId - ID of the AT
 * @param {object} exactAtVersion - Exact AT version to use (optional)
 * @param {object} minimumAtVersion - Minimum AT version to use (required if exactAtVersion not provided)
 * @param {*} transaction - Sequelize transaction
 * @returns {Promise<object>} The AT version that meets the requirements
 */
const getAtVersionWithRequirements = async (
  atId,
  exactAtVersion,
  minimumAtVersion,
  transaction
) => {
  try {
    if (exactAtVersion) {
      return exactAtVersion;
    }

    if (!minimumAtVersion) {
      throw new Error(
        'Either exactAtVersion or minimumAtVersion must be provided'
      );
    }

    if (minimumAtVersion.supportedByAutomation) {
      return minimumAtVersion;
    }

    const matchingAtVersions = await getAtVersions({
      where: {
        atId,
        releasedAt: { [Op.gte]: minimumAtVersion.releasedAt }
      },
      pagination: {
        order: [['releasedAt', 'ASC']]
      },
      transaction
    });

    const supportedVersions =
      AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS[
        matchingAtVersions[0]?.at?.name
      ] || [];

    const latestSupportedAtVersion = matchingAtVersions.find(
      atv =>
        supportedVersions.includes(atv.name) &&
        new Date(atv.releasedAt) >= new Date(minimumAtVersion.releasedAt)
    );

    if (!latestSupportedAtVersion) {
      throw new Error(
        `No suitable AT version found for automation for AT ${atId} ` +
          `with minimumAtVersion ${minimumAtVersion?.name}`
      );
    }

    return latestSupportedAtVersion;
  } catch (error) {
    console.error('Error while determining AT version:', error);
    throw error;
  }
};

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {number} options.id - unique id of the AtVersion model being queried
 * @param {object} options
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtVersionById = async ({
  id,
  atVersionAttributes = AT_VERSION_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  transaction
}) => {
  return ModelService.getById(AtVersion, {
    id,
    attributes: atVersionAttributes,
    include: [atAssociation(atAttributes)],
    transaction
  });
};

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} options
 * @param {object} options.where - unique values of the AtVersion model being queried
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getAtVersionByQuery = async ({
  where: { atId, name, releasedAt },
  atVersionAttributes = AT_VERSION_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  transaction
}) => {
  return ModelService.getByQuery(AtVersion, {
    where: {
      atId,
      ...(name && { name }),
      ...(releasedAt && { releasedAt })
    },
    attributes: atVersionAttributes,
    include: [atAssociation(atAttributes)],
    transaction
  });
};

/**
 * @param {object} options
 * @param {object} options.createParams - values to be used to create the AtVersion record
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const createAtVersion = async ({
  values: { atId, name, releasedAt },
  atVersionAttributes = AT_VERSION_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  transaction
}) => {
  await ModelService.create(AtVersion, {
    values: { atId, name, releasedAt },
    transaction
  });
  return ModelService.getByQuery(AtVersion, {
    where: { atId, name },
    attributes: atVersionAttributes,
    include: [atAssociation(atAttributes)],
    transaction
  });
};

/**
 * @param {object} options
 * @param {object} options.where - values of the AtVersion record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateAtVersionByQuery = async ({
  where: { atId, name, releasedAt },
  values = {},
  atVersionAttributes = AT_VERSION_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  transaction
}) => {
  await ModelService.update(AtVersion, {
    where: { atId, name, releasedAt },
    values,
    transaction
  });
  return ModelService.getByQuery(AtVersion, {
    where: { atId, name: values.name || name, releasedAt },
    attributes: atVersionAttributes,
    include: [atAssociation(atAttributes)],
    transaction
  });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the AtVersion record to be updated
 * @param {object} options.values - values to be used to update columns for the record being referenced
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const updateAtVersionById = async ({
  id,
  values = {},
  atVersionAttributes = AT_VERSION_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  transaction
}) => {
  await ModelService.update(AtVersion, {
    where: { id },
    values,
    transaction
  });
  return ModelService.getById(AtVersion, {
    id,
    attributes: atVersionAttributes,
    include: [atAssociation(atAttributes)],
    transaction
  });
};

/**
 * @param {object} options
 * @param {object} options.where - values of the AtVersion record to be removed
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeAtVersionByQuery = async ({
  where: { atId, name, releasedAt },
  truncate = false,
  transaction
}) => {
  return ModelService.removeByQuery(AtVersion, {
    where: { atId, name, releasedAt },
    truncate,
    transaction
  });
};

/**
 * @param {object} options
 * @param {number} options.id - id of the AtVersion record to be removed
 * @param {boolean} options.truncate - Sequelize specific deletion options that could be passed
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<boolean>}
 */
const removeAtVersionById = async ({ id, truncate = false, transaction }) => {
  return ModelService.removeById(AtVersion, {
    id,
    truncate,
    transaction
  });
};

/**
 * @param {object} options
 * @param {object} options.where - values to be used to create or find the AtVersion record
 * @param {string[]} options.atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} options.atAttributes  - At attributes to be returned in the result
 * @param {*} options.transaction - Sequelize transaction
 * @returns {BrowserVersion}
 */
const findOrCreateAtVersion = async ({
  where: { atId, name, releasedAt },
  atVersionAttributes = AT_VERSION_ATTRIBUTES,
  atAttributes = AT_ATTRIBUTES,
  transaction
}) => {
  let version = await getAtVersionByQuery({
    where: { atId, name },
    atVersionAttributes,
    atAttributes,
    transaction
  });

  if (!version) {
    version = await createAtVersion({
      values: { atId, name, releasedAt: releasedAt ?? new Date() },
      atVersionAttributes,
      atAttributes,
      transaction
    });
  }

  return version;
};

/**
 * Gets the most recent previous AT version and its associated finalized reports
 * @param {object} options
 * @param {number} options.atVersionId - ID of the current AT version
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<{currentVersion: object, previousVersion: object, finalizedReports: object[]}>}
 */
const findPreviousVersionAndReports = async ({ atVersionId, transaction }) => {
  // Get the current AT version with its AT info
  const currentVersion = await getAtVersionById({
    id: atVersionId,
    transaction
  });

  if (!currentVersion) {
    throw new Error(`AT Version with ID ${atVersionId} not found`);
  }

  // Find the most recent previous version for the same AT
  const previousVersion = await AtVersion.findOne({
    where: {
      atId: currentVersion.atId,
      releasedAt: {
        [Op.lt]: currentVersion.releasedAt
      }
    },
    order: [['releasedAt', 'DESC']],
    transaction
  });

  if (!previousVersion) {
    throw new Error(
      `No previous version found for AT Version ID ${atVersionId}`
    );
  }

  // Get all finalized test plan reports that used the previous version
  const finalizedReports = await TestPlanReport.findAll({
    where: {
      [Op.or]: [
        { exactAtVersionId: previousVersion.id },
        { minimumAtVersionId: previousVersion.id }
      ],
      markedFinalAt: {
        [Op.not]: null
      }
    },
    transaction
  });

  return {
    currentVersion,
    previousVersion,
    finalizedReports
  };
};

module.exports = {
  getAtVersions,
  getAtVersionWithRequirements,
  getAtVersionById,
  getAtVersionByQuery,
  createAtVersion,
  updateAtVersionById,
  updateAtVersionByQuery,
  removeAtVersionByQuery,
  removeAtVersionById,
  findOrCreateAtVersion,
  findPreviousVersionAndReports
};
