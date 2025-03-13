const { AuthenticationError } = require('apollo-server-errors');
const checkUserRole = require('./helpers/checkUserRole');
const {
  getVendorApprovalStatusById,
  createVendorApprovalStatus,
  updateVendorApprovalStatusByIds
} = require('../models/services/VendorApprovalStatusService');

const addViewerResolver = async (_, { testId, testPlanReportId }, context) => {
  const { user, transaction } = context;

  const isAdmin = checkUserRole.isAdmin(user?.roles);
  const isVendor = checkUserRole.isVendor(user?.roles);
  if (!(isAdmin || isVendor)) {
    throw new AuthenticationError();
  }

  const viewer = {
    testPlanReportId,
    userId: user.id,
    vendorId: user.vendorId || user.company?.id
  };

  // No need to add a 'viewer' if not affiliated with a company
  if (!viewer?.vendorId) return user;

  try {
    const vendorApprovalStatus = await getVendorApprovalStatusById({
      ...viewer,
      transaction
    });

    if (vendorApprovalStatus) {
      if (!vendorApprovalStatus.viewedTests.includes(testId)) {
        await updateVendorApprovalStatusByIds({
          ...viewer,
          values: {
            viewedTests: [...vendorApprovalStatus.viewedTests, testId]
          },
          transaction
        });
      }
    } else {
      await createVendorApprovalStatus({
        values: {
          ...viewer,
          viewedTests: [testId]
        },
        transaction
      });
    }
  } catch (error) {
    // console.error('addViewerResolver.error', error);
  }

  return user;
};

module.exports = addViewerResolver;
