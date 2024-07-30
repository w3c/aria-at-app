const { Op } = require('sequelize');
const { getAtVersions } = require('../models/services/AtService');

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

    const latestSupportedAtVersion = matchingAtVersions.find(async atv => {
      // supportedByAutomation is a computed graphql field,
      // so we need to compute directly here
      await atv.supportedByAutomation;
      return atv.supportedByAutomation;
    });

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
