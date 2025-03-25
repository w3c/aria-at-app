const { Op } = require('sequelize');
const {
  getReviewerStatuses
} = require('../../models/services/ReviewerStatusService');
const vendorReviewStatusResolver = async (
  testPlanReport,
  args, // eslint-disable-line no-unused-vars
  context
) => {
  const { transaction } = context;

  const where = {
    testPlanReportId: testPlanReport.id,
    vendorId: { [Op.ne]: null } // Only if approval comes from a vendor
  };
  const reviewerStatuses = await getReviewerStatuses({
    where,
    transaction
  });

  // TODO: Use enum for review values
  if (!reviewerStatuses.length) return 'READY';

  // TODO: Determine what to do if there is a difference in statuses; ie. 1 APPROVED and 2 other IN_PROGRESS
  // For now, use a single review as that's been the current expectation
  const isApprovingReview = reviewerStatuses.some(
    ({ reviewStatus }) => reviewStatus === 'APPROVED'
  );
  if (isApprovingReview) return 'APPROVED';
  return 'IN_PROGRESS';
};

module.exports = vendorReviewStatusResolver;
