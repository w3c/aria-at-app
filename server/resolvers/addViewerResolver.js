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
    // Log the error but don't fail the mutation - this is a non-critical operation
    // that tracks which tests a reviewer has viewed. If it fails, we still want to
    // return the user successfully. This is intentionally a best-effort operation
    console.error('addViewerResolver.error', error);
  }

  return user;
};

module.exports = addViewerResolver;
