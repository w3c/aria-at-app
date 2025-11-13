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

    // Get the latest automation-supported version directly
    const latestSupportedAtVersions = await getAtVersions({
      where: {
        atId,
        supportedByAutomation: true,
        latestAutomationSupporting: true
      },
      transaction
    });

    if (!latestSupportedAtVersions.length) {
      throw new Error(
        `No suitable AT version found for automation for AT ${atId} ` +
          `with minimumAtVersion ${minimumAtVersion?.name}`
      );
    }

    return latestSupportedAtVersions[0];
  } catch (error) {
    console.error('Error while determining AT version:', error);
    throw error;
  }
};

module.exports = getAtVersionWithRequirements;
