const {
  getRefreshableTestPlanReportsForVersion
} = require('../models/services/AtVersionService');

/**
 * Resolver for the refreshableReports query
 * @param {*} _ - Parent resolver
 * @param {Object} args - Arguments passed to the resolver
 * @param {string} args.atVersionId - ID of the AT version to check for refreshable reports
 * @param {Object} context - GraphQL context
 * @returns {Promise<Object>} - Promise that resolves to the refreshable reports data
 */
const refreshableReportsResolver = async (_, { atVersionId }, context) => {
  try {
    console.log('atVersionId', atVersionId);
    const { transaction } = context;

    // Ensure atVersionId is properly converted to a number if needed
    const currentAtVersionId = parseInt(atVersionId, 10);

    if (isNaN(currentAtVersionId)) {
      throw new Error(`Invalid atVersionId: ${atVersionId}`);
    }
    console.log('currentAtVersionId', currentAtVersionId);

    const { currentVersion, previousVersionGroups } =
      await getRefreshableTestPlanReportsForVersion({
        currentAtVersionId,
        transaction
      });

    if (!previousVersionGroups?.length) {
      return {
        currentVersion: {
          id: currentVersion.id,
          name: currentVersion.name
        },
        previousVersionGroups: []
      };
    }

    return {
      currentVersion: {
        id: currentVersion.id,
        name: currentVersion.name
      },
      previousVersionGroups: previousVersionGroups.map(group => ({
        previousVersion: {
          id: group.previousVersion.id,
          name: group.previousVersion.name
        },
        testPlans: group.testPlans
      }))
    };
  } catch (error) {
    console.error('Error in refreshableReports resolver:', error);
    throw error;
  }
};

module.exports = refreshableReportsResolver;
