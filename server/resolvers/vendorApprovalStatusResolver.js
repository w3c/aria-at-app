const {
  getVendorApprovalStatusByIds
} = require('../models/services/VendorApprovalStatusService');

const vendorApprovalStatusResolver = async (
  _,
  { userId, vendorId, testPlanReportId },
  context
) => {
  const { transaction } = context;

  return getVendorApprovalStatusByIds({
    userId,
    vendorId,
    testPlanReportId,
    transaction
  });
};

module.exports = vendorApprovalStatusResolver;
