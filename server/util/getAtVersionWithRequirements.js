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

    const isMinimumVersionSupported =
      await minimumAtVersion.supportedByAutomation;
    if (isMinimumVersionSupported) {
      return minimumAtVersion;
    }

    const matchingAts = await getAtVersions({
      where: {
        atId,
        releasedAt: { [Op.gte]: minimumAtVersion.releasedAt }
      },
      pagination: {
        order: [['releasedAt', 'ASC']]
      },
      transaction
    });

    const supportedAts = await Promise.all(
      matchingAts.map(async version => {
        const supportedByAutomation = await version.supportedByAutomation;
        return supportedByAutomation ? version.toJSON() : null;
      })
    );

    const latestSupportedAt = supportedAts.filter(Boolean)[0];

    if (!latestSupportedAt) {
      throw new Error(
        `No suitable AT version found for automation for AT ${atId} ` +
          `with minimumAtVersion ${minimumAtVersion?.name}`
      );
    }

    return latestSupportedAt;
  } catch (error) {
    console.error('Error while determining AT version:', error);
    throw error;
  }
};

module.exports = getAtVersionWithRequirements;
