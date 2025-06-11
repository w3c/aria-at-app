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
    testPlanReportId: testPlanReport.id
  };
  const reviewerStatuses = await getReviewerStatuses({
    where,
    transaction
  });

  // TODO: Use enum for review status values
  if (!reviewerStatuses.length) return 'READY';

  // TODO: Determine what to do if there is a difference in statuses; ie. 1 APPROVED and 2 other IN_PROGRESS
  // For now, use a single review as that's been the current expectation
  const isApprovingReview = reviewerStatuses.some(
    ({ reviewStatus }) => reviewStatus === 'APPROVED'
  );
  if (isApprovingReview) return 'APPROVED';

  const isInProgressReview = reviewerStatuses
    .filter(({ vendorId }) => !!vendorId) // Only consider as in progress if an assigned has viewed
    .some(({ reviewStatus }) => reviewStatus === 'IN_PROGRESS');
  if (isInProgressReview) return 'IN_PROGRESS';

  return 'READY';
};

module.exports = vendorReviewStatusResolver;
