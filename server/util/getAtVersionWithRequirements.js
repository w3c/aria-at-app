const { getAtVersions } = require('../models/services/AtService');
const { AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS } = require('./constants');
const { utils } = require('shared');

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

    // Get all versions for this AT without date filtering
    const matchingAtVersions = await getAtVersions({
      where: { atId },
      transaction
    });

    // Sort versions by semantic version and date
    const sortedVersions = utils.sortAtVersions(matchingAtVersions);

    const supportedVersions =
      AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS[sortedVersions[0]?.at?.name] ||
      [];

    const latestSupportedAtVersion = sortedVersions.find(atv =>
      supportedVersions.includes(atv.name.trim())
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
