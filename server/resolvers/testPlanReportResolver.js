const {
  getTestPlanReportById
} = require('../models/services/TestPlanReportService');

const testPlanReportResolver = async (_, { id }, context) => {
  const { transaction } = context;

  const report = await getTestPlanReportById({ id, transaction });
  return report;
};

module.exports = testPlanReportResolver;
