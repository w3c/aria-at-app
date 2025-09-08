const ModelService = require('./ModelService');
const {
  REVIEWER_STATUS_ATTRIBUTES,
  TEST_PLAN_REPORT_ATTRIBUTES,
  TEST_PLAN_VERSION_ATTRIBUTES,
  USER_ATTRIBUTES,
  VENDOR_ATTRIBUTES
} = require('./helpers');
const { TestPlanReport, ReviewerStatus } = require('../');

// Associate helpers

/**
 * @param {string[]} testPlanReportAttributes - Test Plan Report attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanReportAssociation = testPlanReportAttributes => ({
  association: 'testPlanReport',
  attributes: testPlanReportAttributes
});

/**
 * @param {string[]} testPlanVersionAttributes - Test Plan Version attributes
 * @returns {{association: string, attributes: string[]}}
 */
const testPlanVersionAssociation = testPlanVersionAttributes => ({
  association: 'testPlanVersion',
  attributes: testPlanVersionAttributes
});

/**
 * @param {string[]} userAttributes - User attributes
 * @returns {{association: string, attributes: string[]}}
 */
const userAssociation = userAttributes => ({
  association: 'user',
  attributes: userAttributes
});

/**
 * @param {string[]} vendorAttributes - Vendor attributes
 * @returns {{association: string, attributes: string[]}}
 */
const vendorAssociation = vendorAttributes => ({
  association: 'vendor',
  attributes: vendorAttributes
});

/**
 * @param testPlanReportId
 * @param userId
 * @param vendorId
 * @param reviewerStatusAttributes
 * @param testPlanReportAttributes
 * @param testPlanVersionAttributes
 * @param userAttributes
 * @param vendorAttributes
 * @param transaction
 * @returns {Promise<Model>}
 */
const getReviewerStatusById = async ({
  testPlanReportId,
  userId,
  reviewerStatusAttributes = REVIEWER_STATUS_ATTRIBUTES,
  testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
  testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  vendorAttributes = VENDOR_ATTRIBUTES,
  transaction
}) => {
  return ModelService.getByQuery(ReviewerStatus, {
    where: {
      testPlanReportId,
      userId
    },
    attributes: reviewerStatusAttributes,
    include: [
      testPlanReportAssociation(testPlanReportAttributes),
      testPlanVersionAssociation(testPlanVersionAttributes),
      userAssociation(userAttributes),
      vendorAssociation(vendorAttributes)
    ],
    transaction
  });
};

/**
 * @param where
 * @param reviewerStatusAttributes
 * @param testPlanReportAttributes
 * @param testPlanVersionAttributes
 * @param userAttributes
 * @param vendorAttributes
 * @param pagination
 * @param transaction
 * @returns {Promise<*>}
 */
const getReviewerStatuses = async ({
  where = {},
  reviewerStatusAttributes = REVIEWER_STATUS_ATTRIBUTES,
  testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
  testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  vendorAttributes = VENDOR_ATTRIBUTES,
  pagination = {},
  transaction
}) => {
  return ModelService.get(ReviewerStatus, {
    where,
    attributes: reviewerStatusAttributes,
    include: [
      testPlanReportAssociation(testPlanReportAttributes),
      testPlanVersionAssociation(testPlanVersionAttributes),
      userAssociation(userAttributes),
      vendorAssociation(vendorAttributes)
    ],
    pagination,
    transaction
  });
};

/**
 * @param testPlanReportId
 * @param userId
 * @param vendorId
 * @param reviewStatus
 * @param approvedAt
 * @param viewedTests
 * @param reviewerStatusAttributes
 * @param testPlanReportAttributes
 * @param testPlanVersionAttributes
 * @param userAttributes
 * @param vendorAttributes
 * @param transaction
 * @returns {Promise<Model>}
 */
const createReviewerStatus = async ({
  values: {
    testPlanReportId,
    userId,
    vendorId,
    reviewStatus,
    approvedAt,
    viewedTests = []
  },
  reviewerStatusAttributes = REVIEWER_STATUS_ATTRIBUTES,
  testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
  testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  vendorAttributes = VENDOR_ATTRIBUTES,
  transaction
}) => {
  const testPlanReport = await TestPlanReport.findOne({
    where: { id: testPlanReportId },
    transaction
  });
  await ModelService.create(ReviewerStatus, {
    values: {
      testPlanReportId,
      testPlanVersionId: testPlanReport.testPlanVersionId,
      userId,
      vendorId,
      reviewStatus,
      approvedAt,
      viewedTests
    },
    transaction
  });

  return getReviewerStatusById({
    testPlanReportId,
    userId,
    vendorId,
    reviewerStatusAttributes,
    testPlanReportAttributes,
    testPlanVersionAttributes,
    userAttributes,
    vendorAttributes,
    transaction
  });
};

/**
 * @param testPlanReportId
 * @param userId
 * @param vendorId
 * @param viewedTests
 * @param reviewStatus
 * @param approvedAt
 * @param reviewerStatusAttributes
 * @param testPlanReportAttributes
 * @param testPlanVersionAttributes
 * @param userAttributes
 * @param vendorAttributes
 * @param transaction
 * @returns {Promise<Model>}
 */
const updateReviewerStatusByIds = async ({
  testPlanReportId,
  userId,
  values: { vendorId, viewedTests, reviewStatus, approvedAt },
  reviewerStatusAttributes = REVIEWER_STATUS_ATTRIBUTES,
  testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
  testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  vendorAttributes = VENDOR_ATTRIBUTES,
  transaction
}) => {
  await ModelService.update(ReviewerStatus, {
    where: {
      testPlanReportId,
      userId
    },
    values: {
      vendorId,
      reviewStatus,
      approvedAt,
      viewedTests
    },
    transaction
  });

  return getReviewerStatusById({
    testPlanReportId,
    userId,
    vendorId,
    reviewerStatusAttributes,
    testPlanReportAttributes,
    testPlanVersionAttributes,
    userAttributes,
    vendorAttributes,
    transaction
  });
};

/**
 * @param testPlanReportId
 * @param userId
 * @param vendorId
 * @param viewedTests
 * @param reviewStatus
 * @param approvedAt
 * @param reviewerStatusAttributes
 * @param testPlanReportAttributes
 * @param testPlanVersionAttributes
 * @param userAttributes
 * @param vendorAttributes
 * @param transaction
 * @returns {Promise<Model>}
 */
const updateReviewerStatusesByTestPlanReportId = async ({
  testPlanReportId,
  values: { vendorId, viewedTests, reviewStatus, approvedAt },
  reviewerStatusAttributes = REVIEWER_STATUS_ATTRIBUTES,
  testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
  testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  vendorAttributes = VENDOR_ATTRIBUTES,
  transaction
}) => {
  await ModelService.update(ReviewerStatus, {
    where: {
      testPlanReportId
    },
    values: {
      vendorId,
      reviewStatus,
      approvedAt,
      viewedTests
    },
    transaction
  });

  return getReviewerStatuses({
    where: { testPlanReportId },
    reviewerStatusAttributes,
    testPlanReportAttributes,
    testPlanVersionAttributes,
    userAttributes,
    vendorAttributes,
    transaction
  });
};

/**
 * @param testPlanReportId
 * @param userId
 * @param testId
 * @param vendorId
 * @param reviewerStatusAttributes
 * @param testPlanReportAttributes
 * @param testPlanVersionAttributes
 * @param userAttributes
 * @param vendorAttributes
 * @param transaction
 * @returns {Promise<Model>}
 */
const createOrUpdateReviewerStatus = async ({
  testPlanReportId,
  userId,
  testId,
  vendorId,
  reviewerStatusAttributes = REVIEWER_STATUS_ATTRIBUTES,
  testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
  testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  vendorAttributes = VENDOR_ATTRIBUTES,
  transaction
}) => {
  const testPlanReport = await TestPlanReport.findOne({
    where: { id: testPlanReportId },
    transaction
  });

  const existing = await ReviewerStatus.findOne({
    where: { testPlanReportId, userId },
    transaction
  });

  const viewedTests = existing
    ? [...new Set([...existing.viewedTests, testId])]
    : [testId];

  let upsertValues = {
    testPlanReportId,
    testPlanVersionId: testPlanReport.testPlanVersionId,
    userId,
    vendorId,
    viewedTests
  };
  if (!existing) upsertValues.reviewStatus = vendorId ? 'IN_PROGRESS' : null;

  await ReviewerStatus.upsert(upsertValues, { transaction });

  return getReviewerStatusById({
    testPlanReportId,
    userId,
    reviewerStatusAttributes,
    testPlanReportAttributes,
    testPlanVersionAttributes,
    userAttributes,
    vendorAttributes,
    transaction
  });
};

module.exports = {
  // Basic CRUD
  getReviewerStatusById,
  getReviewerStatuses,
  createReviewerStatus,
  updateReviewerStatusByIds,
  updateReviewerStatusesByTestPlanReportId,
  createOrUpdateReviewerStatus
};
