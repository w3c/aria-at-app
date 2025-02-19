const ModelService = require('./ModelService');
const {
  VENDOR_APPROVAL_STATUS_ATTRIBUTES,
  TEST_PLAN_REPORT_ATTRIBUTES,
  TEST_PLAN_VERSION_ATTRIBUTES,
  USER_ATTRIBUTES,
  VENDOR_ATTRIBUTES
} = require('./helpers');
const { TestPlanReport, VendorApprovalStatus } = require('../');

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
 * @param vendorApprovalStatusAttributes
 * @param testPlanReportAttributes
 * @param testPlanVersionAttributes
 * @param userAttributes
 * @param vendorAttributes
 * @param transaction
 * @returns {Promise<Model>}
 */
const getVendorApprovalStatusByIds = async ({
  testPlanReportId,
  userId,
  vendorId,
  vendorApprovalStatusAttributes = VENDOR_APPROVAL_STATUS_ATTRIBUTES,
  testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
  testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  vendorAttributes = VENDOR_ATTRIBUTES,
  transaction
}) => {
  return ModelService.getByQuery(VendorApprovalStatus, {
    where: {
      testPlanReportId,
      userId,
      vendorId
    },
    attributes: vendorApprovalStatusAttributes,
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
 * @param vendorApprovalStatusAttributes
 * @param testPlanReportAttributes
 * @param testPlanVersionAttributes
 * @param userAttributes
 * @param vendorAttributes
 * @param pagination
 * @param transaction
 * @returns {Promise<*>}
 */
const getVendorApprovalStatuses = async ({
  where = {},
  vendorApprovalStatusAttributes = VENDOR_APPROVAL_STATUS_ATTRIBUTES,
  testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
  testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  vendorAttributes = VENDOR_ATTRIBUTES,
  pagination = {},
  transaction
}) => {
  return ModelService.get(VendorApprovalStatus, {
    where,
    attributes: vendorApprovalStatusAttributes,
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
 * @param viewedTests
 * @param vendorApprovalStatusAttributes
 * @param testPlanReportAttributes
 * @param testPlanVersionAttributes
 * @param userAttributes
 * @param vendorAttributes
 * @param transaction
 * @returns {Promise<Model>}
 */
const createVendorApprovalStatus = async ({
  values: { testPlanReportId, userId, vendorId, viewedTests = [] },
  vendorApprovalStatusAttributes = VENDOR_APPROVAL_STATUS_ATTRIBUTES,
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
  await ModelService.create(VendorApprovalStatus, {
    values: {
      testPlanReportId,
      testPlanVersionId: testPlanReport.testPlanVersionId,
      userId,
      vendorId,
      viewedTests
    },
    transaction
  });

  return getVendorApprovalStatusByIds({
    testPlanReportId,
    userId,
    vendorId,
    vendorApprovalStatusAttributes,
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
 * @param vendorApprovalStatusAttributes
 * @param testPlanReportAttributes
 * @param testPlanVersionAttributes
 * @param userAttributes
 * @param vendorAttributes
 * @param transaction
 * @returns {Promise<Model>}
 */
const updateVendorApprovalStatusByIds = async ({
  testPlanReportId,
  userId,
  vendorId,
  values: { viewedTests, reviewStatus, approvedAt },
  vendorApprovalStatusAttributes = VENDOR_APPROVAL_STATUS_ATTRIBUTES,
  testPlanReportAttributes = TEST_PLAN_REPORT_ATTRIBUTES,
  testPlanVersionAttributes = TEST_PLAN_VERSION_ATTRIBUTES,
  userAttributes = USER_ATTRIBUTES,
  vendorAttributes = VENDOR_ATTRIBUTES,
  transaction
}) => {
  await ModelService.update(VendorApprovalStatus, {
    where: {
      testPlanReportId,
      userId,
      vendorId
    },
    values: {
      reviewStatus,
      approvedAt,
      viewedTests
    },
    transaction
  });

  return getVendorApprovalStatusByIds({
    testPlanReportId,
    userId,
    vendorId,
    vendorApprovalStatusAttributes,
    testPlanReportAttributes,
    testPlanVersionAttributes,
    userAttributes,
    vendorAttributes,
    transaction
  });
};

module.exports = {
  // Basic CRUD
  getVendorApprovalStatusByIds,
  getVendorApprovalStatuses,
  createVendorApprovalStatus,
  updateVendorApprovalStatusByIds
};
