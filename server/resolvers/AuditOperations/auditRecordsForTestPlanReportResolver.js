const { AuthenticationError } = require('apollo-server');
const {
  getAuditRecordsForTestPlanReport
} = require('../../models/services/AuditService');

const auditRecordsForTestPlanReportResolver = async (
  { parentContext: { id: testPlanReportId } },
  _,
  context
) => {
  const { user, transaction } = context;

  if (
    !(
      user?.roles.find(role => role.name === 'ADMIN') ||
      user?.roles.find(role => role.name === 'TESTER') ||
      user?.roles.find(role => role.name === 'VENDOR')
    )
  ) {
    throw new AuthenticationError();
  }

  return getAuditRecordsForTestPlanReport({
    testPlanReportId,
    pagination: {
      order: [['createdAt', 'DESC']],
      enablePagination: false
    },
    transaction
  });
};

module.exports = auditRecordsForTestPlanReportResolver;
