const { Op } = require('sequelize');
const { getAtVersions } = require('../models/services/AtService');
const { AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS } = require('./constants');

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
      // If there is ever a significant shift in how the ATs' versions we're
      // collecting changes, this has to be revisited
      pagination: {
        order: [
          ['name', 'DESC'],
          ['releasedAt', 'DESC']
        ]
      },
      transaction
    });

    const supportedVersions =
      AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS[
        matchingAtVersions[0]?.at?.name
      ] || [];

    const latestSupportedAtVersion = matchingAtVersions.find(
      atv =>
        supportedVersions.includes(atv.name.trim()) &&
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

module.exports = getAtVersionWithRequirements;
