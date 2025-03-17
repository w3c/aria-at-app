const {
  getReviewerStatuses
} = require('../models/services/ReviewerStatusService');

const reviewerStatusesResolver = async (_, __, context) => {
  const { transaction } = context;

  const where = {};

  return getReviewerStatuses({
    where,
    pagination: { order: [['updatedAt', 'desc']] },
    transaction
  });
};

module.exports = reviewerStatusesResolver;
