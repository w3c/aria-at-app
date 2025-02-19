const {
  getVendorApprovalStatuses
} = require('../models/services/VendorApprovalStatusService');

const vendorApprovalStatusesResolver = async (_, __, context) => {
  const { transaction } = context;

  const where = {};

  return getVendorApprovalStatuses({
    where,
    pagination: { order: [['updatedAt', 'desc']] },
    transaction
  });
};

module.exports = vendorApprovalStatusesResolver;
