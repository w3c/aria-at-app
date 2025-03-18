const {
  getRefreshableTestPlanReportsForVersion
} = require('../models/services/AtVersionService');
const {
  getTestPlanVersionById
} = require('../models/services/TestPlanVersionService');

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
    const { transaction } = context;

    // Ensure atVersionId is properly converted to a number if needed
    const currentAtVersionId = parseInt(atVersionId, 10);

    if (isNaN(currentAtVersionId)) {
      throw new Error(`Invalid atVersionId: ${atVersionId}`);
    }

    const { currentVersion, previousVersion, refreshableReports } =
      await getRefreshableTestPlanReportsForVersion({
        currentAtVersionId,
        transaction
      });

    if (!previousVersion || refreshableReports.length === 0) {
      return {
        currentVersion: {
          id: currentVersion.id,
          name: currentVersion.name
        },
        previousVersionGroups: []
      };
    }

    // Group test plans by previous version
    const reportsByPreviousVersion = {};

    // Process all refreshable reports
    for (const report of refreshableReports) {
      if (!report.testPlanVersionId) continue;

      const testPlanVersion = await getTestPlanVersionById({
        id: report.testPlanVersionId,
        transaction
      });

      if (!testPlanVersion) continue;

      // Group by previous version
      if (!reportsByPreviousVersion[previousVersion.id]) {
        reportsByPreviousVersion[previousVersion.id] = {
          previousVersion: {
            id: previousVersion.id,
            name: previousVersion.name
          },
          testPlans: []
        };
      }

      // Add to the group if not already added
      const existingTestPlan = reportsByPreviousVersion[
        previousVersion.id
      ].testPlans.find(tp => tp.id === testPlanVersion.id);

      if (!existingTestPlan) {
        reportsByPreviousVersion[previousVersion.id].testPlans.push({
          id: testPlanVersion.id,
          title: testPlanVersion.title
        });
      }
    }

    return {
      currentVersion: {
        id: currentVersion.id,
        name: currentVersion.name
      },
      previousVersionGroups: Object.values(reportsByPreviousVersion)
    };
  } catch (error) {
    console.error('Error in refreshableReports resolver:', error);
    throw error;
  }
};

module.exports = refreshableReportsResolver;
