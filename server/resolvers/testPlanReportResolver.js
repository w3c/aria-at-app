const DataLoader = require('dataloader');
const {
  getTestPlanReports
} = require('../models/services/TestPlanReportService');

const createTestPlanReportBatchLoader = context => {
  return new DataLoader(async testPlanReportIds => {
    const reports = await getTestPlanReports({
      where: { id: testPlanReportIds },
      transaction: context.transaction
    });

    const reportsById = {};
    reports.forEach(report => {
      reportsById[report.id] = report;
    });

    return testPlanReportIds.map(id => reportsById[id] || null);
  });
};

const testPlanReportResolver = async (_, { id }, context) => {
  if (!context.loaders) {
    context.loaders = {};
  }

  if (!context.loaders.testPlanReportById) {
    context.loaders.testPlanReportById =
      createTestPlanReportBatchLoader(context);
  }

  return context.loaders.testPlanReportById.load(id);
};

module.exports = testPlanReportResolver;
