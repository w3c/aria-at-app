const {
  getReviewerStatusById
} = require('../models/services/ReviewerStatusService');

const reviewerStatusResolver = async (
  _,
  { userId, testPlanReportId },
  context
) => {
  const { transaction } = context;

  return getReviewerStatusById({
    userId,
    testPlanReportId,
    transaction
  });
};

module.exports = reviewerStatusResolver;
