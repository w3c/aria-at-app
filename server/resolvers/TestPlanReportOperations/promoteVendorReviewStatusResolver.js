const { AuthenticationError } = require('apollo-server-errors');
const populateData = require('../../services/PopulatedData/populateData');
const checkUserRole = require('../helpers/checkUserRole');
const {
  updateVendorApprovalStatusByIds
} = require('../../models/services/VendorApprovalStatusService');

const promoteVendorReviewStatusResolver = async (
  { parentContext: { id: testPlanReportId } },
  { reviewStatus },
  context
) => {
  const { user, transaction } = context;

  const isAdmin = checkUserRole.isAdmin(user?.roles);
  const isVendor = checkUserRole.isVendor(user?.roles);
  if (!(isAdmin || isVendor)) {
    throw new AuthenticationError();
  }

  if (user.vendorId || user.company?.id) {
    await updateVendorApprovalStatusByIds({
      testPlanReportId,
      userId: user.id,
      vendorId: user.vendorId || user.company?.id,
      values: {
        reviewStatus,
        approvedAt: reviewStatus === 'APPROVED' ? new Date() : null
      },
      transaction
    });
  }
  return populateData({ testPlanReportId }, { context });
};

module.exports = promoteVendorReviewStatusResolver;
