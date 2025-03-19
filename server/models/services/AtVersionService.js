const ModelService = require('./ModelService');
const { AtVersion, TestPlanReport } = require('..');
const { Op } = require('sequelize');
const { AT_VERSION_ATTRIBUTES, AT_ATTRIBUTES } = require('./helpers');
const {
  AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS
} = require('../../util/constants');

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
 * Returns all the unique AT Versions used when collecting results from testers
 * for a Test Plan Report
 * @param {number} testPlanReportId - id of the test plan report
 * @param {object} options
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<*>}
 */
const getUniqueAtVersionsForReport = async (
  testPlanReportId,
  { transaction }
) => {
  const results = await ModelService.rawQuery(
    `
      select "At".name        as "atName",
             "atVersionId",
             "AtVersion".name as "atVersionName",
             "releasedAt",
             "testPlanReportId",
             "testerUserId",
             "testPlanRunId"
      from ( select distinct "TestPlanReport".id                                              as "testPlanReportId",
                             "TestPlanRun".id                                                 as "testPlanRunId",
                             "TestPlanRun"."testerUserId",
                             (jsonb_array_elements("testResults") ->> 'atVersionId')::integer as "atVersionId"
             from "TestPlanReport"
                    left outer join "TestPlanRun" on "TestPlanRun"."testPlanReportId" = "TestPlanReport".id
             where "testPlanReportId" = ${testPlanReportId}
             group by "TestPlanReport".id, "TestPlanRun".id ) as atVersionResults
             join "AtVersion" on "AtVersion".id = atVersionResults."atVersionId"
             join "At" on "AtVersion"."atId" = "At".id;
    `,
    { transaction }
  );

  // Sort in descending order of releasedAt date
  results.sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt));

  return results;
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
 * Gets refreshable Test Plan Reports by identifying reports that can be re-run with a newer AT version.
 *
 * A test plan report can be re-run for a specified AT Version when it meets the following criteria:
 * - The Test Plan Version for the Test Plan Report is in Candidate or Recommended
 * - The Test Plan Report has been marked final
 * - The Test Plan Report is the most recently "finalized" Report for the Test Plan Version
 * - The most recent AT version used in any Test Plan Run is older than the specified AT Version
 * - If multiple reports exist for the same test plan version and browser, only the one with the most recent AT version is included
 *
 * @param {object} options
 * @param {number} options.currentAtVersionId - ID of the current automatable AT version
 * @param {*} options.transaction - Sequelize transaction
 * @returns {Promise<{currentVersion: object, previousVersionGroups: object[]}>}
 */
const getRefreshableTestPlanReportsForVersion = async ({
  currentAtVersionId,
  transaction
}) => {
  // Get current version with AT info
  const currentVersion = await ModelService.getById(AtVersion, {
    id: currentAtVersionId,
    attributes: AT_VERSION_ATTRIBUTES,
    include: [atAssociation(AT_ATTRIBUTES)],
    transaction
  });

  if (!currentVersion?.at?.name) {
    throw new Error(
      `AT Version with ID ${currentAtVersionId} not found or has no associated AT`
    );
  }

  // Check if version is supported by automation
  const supportedVersionNames =
    AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS[currentVersion.at.name] || [];
  if (!supportedVersionNames.includes(currentVersion.name)) {
    return { currentVersion, previousVersionGroups: [] };
  }

  // Get all finalized reports for this AT
  const finalizedReports = await TestPlanReport.findAll({
    where: {
      atId: currentVersion.atId,
      markedFinalAt: { [Op.not]: null }
    },
    include: [
      {
        association: 'testPlanVersion',
        where: { phase: { [Op.in]: ['CANDIDATE', 'RECOMMENDED'] } },
        required: true,
        include: [{ association: 'testPlan', required: true }]
      },
      { association: 'testPlanRuns', required: true },
      { association: 'browser', required: true },
      { association: 'at', required: true }
    ],
    order: [['markedFinalAt', 'DESC']],
    transaction
  });

  // Get reports already using current version
  const existingReportCombos = new Set(
    (
      await TestPlanReport.findAll({
        where: {
          atId: currentVersion.atId,
          [Op.or]: [
            { exactAtVersionId: currentAtVersionId },
            { minimumAtVersionId: currentAtVersionId }
          ]
        },
        attributes: ['testPlanVersionId', 'browserId'],
        transaction
      })
    ).map(r => `${r.testPlanVersionId}-${r.browserId}`)
  );

  // Group reports by test plan version and browser combination
  const reportsByCombo = new Map();

  for (const report of finalizedReports) {
    const combo = `${report.testPlanVersionId}-${report.browserId}`;
    if (existingReportCombos.has(combo)) continue;

    // Find most recent AT version used in test runs
    const mostRecentAtVersionId = report.testPlanRuns.reduce((latest, run) => {
      if (!Array.isArray(run.testResults)) return latest;

      return run.testResults.reduce((ver, result) => {
        const resultVer = parseInt(result.atVersionId, 10);
        return !ver || (resultVer && resultVer > ver) ? resultVer : ver;
      }, latest);
    }, null);

    if (!mostRecentAtVersionId) continue;

    const usedVersion = await AtVersion.findByPk(mostRecentAtVersionId, {
      transaction
    });
    if (
      !usedVersion ||
      new Date(usedVersion.releasedAt) >= new Date(currentVersion.releasedAt)
    )
      continue;

    // Store report info along with its AT version
    if (!reportsByCombo.has(combo)) {
      reportsByCombo.set(combo, { report, atVersionId: mostRecentAtVersionId });
    } else {
      const existing = reportsByCombo.get(combo);
      // Replace if this report has a more recent AT version
      if (mostRecentAtVersionId > existing.atVersionId) {
        reportsByCombo.set(combo, {
          report,
          atVersionId: mostRecentAtVersionId
        });
      }
    }
  }

  // Group reports by AT version
  const versionGroups = new Map();
  for (const { report, atVersionId } of reportsByCombo.values()) {
    if (!versionGroups.has(atVersionId)) {
      versionGroups.set(atVersionId, []);
    }
    versionGroups.get(atVersionId).push(report);
  }

  // Format response
  const previousVersionGroups = await Promise.all(
    Array.from(versionGroups.entries()).map(async ([versionId, reports]) => {
      const previousVersion = await ModelService.getById(AtVersion, {
        id: versionId,
        attributes: AT_VERSION_ATTRIBUTES,
        transaction
      });
      return previousVersion ? { previousVersion, reports } : null;
    })
  );

  return {
    currentVersion,
    previousVersionGroups: previousVersionGroups.filter(Boolean)
  };
};

const getHistoricalReportsForVerdictCopying = async ({
  currentAtVersionId,
  transaction
}) => {
  // Get current version with AT info
  const currentVersion = await ModelService.getById(AtVersion, {
    id: currentAtVersionId,
    attributes: AT_VERSION_ATTRIBUTES,
    include: [atAssociation(AT_ATTRIBUTES)],
    transaction
  });

  if (!currentVersion?.at?.name) {
    throw new Error(
      `AT Version with ID ${currentAtVersionId} not found or has no associated AT`
    );
  }

  // Get all finalized reports for this AT
  const finalizedReports = await TestPlanReport.findAll({
    where: {
      atId: currentVersion.atId,
      markedFinalAt: { [Op.not]: null }
    },
    include: [
      {
        association: 'testPlanVersion',
        where: { phase: { [Op.in]: ['CANDIDATE', 'RECOMMENDED'] } },
        required: true,
        include: [{ association: 'testPlan', required: true }]
      },
      { association: 'testPlanRuns', required: true },
      { association: 'browser', required: true },
      { association: 'at', required: true }
    ],
    order: [['markedFinalAt', 'DESC']],
    transaction
  });

  // Group reports by test plan version and browser combination
  const reportsByCombo = new Map();

  for (const report of finalizedReports) {
    const combo = `${report.testPlanVersionId}-${report.browserId}`;

    // Find most recent AT version used in test runs
    const mostRecentAtVersionId = report.testPlanRuns.reduce((latest, run) => {
      if (!Array.isArray(run.testResults)) return latest;

      return run.testResults.reduce((ver, result) => {
        const resultVer = parseInt(result.atVersionId, 10);
        return !ver || (resultVer && resultVer > ver) ? resultVer : ver;
      }, latest);
    }, null);

    if (!mostRecentAtVersionId) continue;

    const usedVersion = await AtVersion.findByPk(mostRecentAtVersionId, {
      transaction
    });
    if (
      !usedVersion ||
      new Date(usedVersion.releasedAt) >= new Date(currentVersion.releasedAt)
    )
      continue;

    // Store report info along with its AT version
    if (!reportsByCombo.has(combo)) {
      reportsByCombo.set(combo, { report, atVersionId: mostRecentAtVersionId });
    } else {
      const existing = reportsByCombo.get(combo);
      // Replace if this report has a more recent AT version
      if (mostRecentAtVersionId > existing.atVersionId) {
        reportsByCombo.set(combo, {
          report,
          atVersionId: mostRecentAtVersionId
        });
      }
    }
  }

  // Group reports by AT version
  const versionGroups = new Map();
  for (const { report, atVersionId } of reportsByCombo.values()) {
    if (!versionGroups.has(atVersionId)) {
      versionGroups.set(atVersionId, []);
    }
    versionGroups.get(atVersionId).push(report);
  }

  // Format response
  const previousVersionGroups = await Promise.all(
    Array.from(versionGroups.entries()).map(async ([versionId, reports]) => {
      const previousVersion = await ModelService.getById(AtVersion, {
        id: versionId,
        attributes: AT_VERSION_ATTRIBUTES,
        transaction
      });
      return previousVersion ? { previousVersion, reports } : null;
    })
  );

  return {
    currentVersion,
    previousVersionGroups: previousVersionGroups.filter(Boolean)
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
  getUniqueAtVersionsForReport,
  getRefreshableTestPlanReportsForVersion,
  getHistoricalReportsForVerdictCopying
};
