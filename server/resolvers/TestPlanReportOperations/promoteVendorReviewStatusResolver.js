const { AuthenticationError } = require('apollo-server-errors');
const populateData = require('../../services/PopulatedData/populateData');
const checkUserRole = require('../helpers/checkUserRole');
const {
  updateReviewerStatusByIds
} = require('../../models/services/ReviewerStatusService');

const promoteVendorReviewStatusResolver = async (
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

  // This being null means approval is from admin
  const vendorId = user.vendorId || user.company?.id;

  await updateReviewerStatusByIds({
    testPlanReportId,
    userId: user.id,
    vendorId,
    values: {
      reviewStatus: 'APPROVED',
      approvedAt: new Date()
    },
    transaction
  });
  return populateData({ testPlanReportId }, { context });
};

module.exports = promoteVendorReviewStatusResolver;
