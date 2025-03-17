const {
  getVendorApprovalStatusById
} = require('../models/services/VendorApprovalStatusService');

const vendorApprovalStatusResolver = async (
  _,
  { userId, vendorId, testPlanReportId },
  context
) => {
  const { transaction } = context;

  return getVendorApprovalStatusById({
    userId,
    vendorId,
    testPlanReportId,
    transaction
  });
};

module.exports = vendorApprovalStatusResolver;
