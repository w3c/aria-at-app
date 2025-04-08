const { AuthenticationError } = require('apollo-server-errors');
const checkUserRole = require('./helpers/checkUserRole');
const {
  createOrUpdateReviewerStatus
} = require('../models/services/ReviewerStatusService');

const addViewerResolver = async (_, { testId, testPlanReportId }, context) => {
  const { user, transaction } = context;

  const isAdmin = checkUserRole.isAdmin(user?.roles);
  const isVendor = checkUserRole.isVendor(user?.roles);
  if (!(isAdmin || isVendor)) {
    throw new AuthenticationError();
  }

  const vendorId = user.vendorId || user.company?.id;

  try {
    await createOrUpdateReviewerStatus({
      testPlanReportId,
      userId: user.id,
      testId,
      vendorId,
      transaction
    });
  } catch (error) {
    console.error('addViewerResolver.error', error);
  }

  return user;
};

module.exports = addViewerResolver;
