const {
  getAuditRecordsForTestPlanReport
} = require('../../models/services/AuditService');

const auditRecordsResolver = async (
  testPlanReport,
  args, // eslint-disable-line no-unused-vars
  context
) => {
  const { transaction } = context;

  return await getAuditRecordsForTestPlanReport({
    testPlanReportId: testPlanReport.id,
    pagination: {
      order: [['createdAt', 'DESC']]
    },
    transaction
  });
};

module.exports = auditRecordsResolver;
