const { AuthenticationError } = require('apollo-server-errors');
const populateData = require('../../services/PopulatedData/populateData');
const checkUserRole = require('../helpers/checkUserRole');
const {
  updateReviewerStatusesByTestPlanReportId
} = require('../../models/services/ReviewerStatusService');

const removeVendorReviewApprovalStatusResolver = async (
  { parentContext: { id: testPlanReportId } },
  _,
  context
) => {
  const { user, transaction } = context;

  const isAdmin = checkUserRole.isAdmin(user?.roles);
  const isVendor = checkUserRole.isVendor(user?.roles);
  if (!(isAdmin || isVendor)) {
    throw new AuthenticationError();
  }

  await updateReviewerStatusesByTestPlanReportId({
    testPlanReportId,
    values: {
      reviewStatus: 'IN_PROGRESS',
      approvedAt: null
    },
    transaction
  });
  return populateData({ testPlanReportId }, { context });
};

module.exports = removeVendorReviewApprovalStatusResolver;
