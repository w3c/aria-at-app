const {
  getVendorApprovalStatuses
} = require('../../models/services/VendorApprovalStatusService');
const vendorReviewStatusResolver = async (
  testPlanReport,
  args, // eslint-disable-line no-unused-vars
  context
) => {
  const { transaction } = context;

  // return testPlanReport.vendorReviewStatus

  const where = {
    testPlanReportId: testPlanReport.id
  };
  const vendorApprovalStatuses = await getVendorApprovalStatuses({
    where,
    transaction
  });

  // TODO: Use enum for review values
  if (!vendorApprovalStatuses.length) return 'READY';

  // TODO: Determine what to do if there is a difference in statuses; ie. 1 APPROVED and 2 other IN_PROGRESS
  // For now, use a single review as that's been the current expectation
  const isApprovingReview = vendorApprovalStatuses.some(
    ({ reviewStatus }) => reviewStatus === 'APPROVED'
  );
  if (isApprovingReview) return 'APPROVED';
  return 'IN_PROGRESS';
};

module.exports = vendorReviewStatusResolver;
