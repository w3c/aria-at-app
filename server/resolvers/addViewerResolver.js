const { AuthenticationError } = require('apollo-server-errors');
const checkUserRole = require('./helpers/checkUserRole');
const {
  getReviewerStatusById,
  createReviewerStatus,
  updateReviewerStatusByIds
} = require('../models/services/ReviewerStatusService');

const addViewerResolver = async (_, { testId, testPlanReportId }, context) => {
  const { user, transaction } = context;

  const isAdmin = checkUserRole.isAdmin(user?.roles);
  const isVendor = checkUserRole.isVendor(user?.roles);
  if (!(isAdmin || isVendor)) {
    throw new AuthenticationError();
  }

  let viewer = {
    testPlanReportId,
    userId: user.id
  };

  const vendorId = user.vendorId || user.company?.id;
  if (vendorId) viewer.vendorId = vendorId;

  try {
    const reviewerStatus = await getReviewerStatusById({
      ...viewer,
      transaction
    });

    if (reviewerStatus) {
      if (!reviewerStatus.viewedTests.includes(testId)) {
        let updateValues = {
          viewedTests: [...reviewerStatus.viewedTests, testId]
        };

        // Only check if a vendorId hasn't already been set. Unlikely event but
        // worth catching in extremely special instances
        if (
          !reviewerStatus.vendorId ||
          (reviewerStatus.vendorId && reviewerStatus.vendorId !== vendorId)
        ) {
          updateValues.vendorId = vendorId;
        }

        await updateReviewerStatusByIds({
          ...viewer,
          values: updateValues,
          transaction
        });
      }
    } else {
      await createReviewerStatus({
        values: {
          ...viewer,
          reviewStatus: viewer.vendorId ? 'IN_PROGRESS' : null,
          viewedTests: [testId]
        },
        transaction
      });
    }
  } catch (error) {
    console.error('addViewerResolver.error', error);
  }

  return user;
};

module.exports = addViewerResolver;
