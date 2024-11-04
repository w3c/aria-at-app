const { AuthenticationError } = require('apollo-server-errors');
const {
  updateTestPlanReportById
} = require('../../models/services/TestPlanReportService');
const populateData = require('../../services/PopulatedData/populateData');
const checkUserRole = require('../helpers/checkUserRole');

const promoteVendorReviewStatusResolver = async (
  { parentContext: { id: testPlanReportId } },
  { vendorReviewStatus },
  context
) => {
  const { user, transaction } = context;

  const isAdmin = checkUserRole.isAdmin(user?.roles);
  const isVendor = checkUserRole.isVendor(user?.roles);
  if (!(isAdmin || isVendor)) {
    throw new AuthenticationError();
  }

  let values = { vendorReviewStatus };

  if (vendorReviewStatus === 'READY') {
    values = {
      vendorReviewStatus: 'IN_PROGRESS'
    };
  } else if (vendorReviewStatus === 'IN_PROGRESS') {
    values = {
      vendorReviewStatus: 'APPROVED'
    };
  }

  if (vendorReviewStatus !== 'APPROVED') {
    await updateTestPlanReportById({
      id: testPlanReportId,
      values,
      transaction
    });
  }

  return populateData({ testPlanReportId }, { context });
};

module.exports = promoteVendorReviewStatusResolver;
