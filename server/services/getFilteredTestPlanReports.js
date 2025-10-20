const {
  getTestPlanReports
} = require('../models/services/TestPlanReportService');

const getFilteredTestPlanReports = async (
  { atId, browserId } = {},
  { transaction }
) => {
  const testPlanReports = await getTestPlanReports({
    where: {
      ...(atId ? { atId } : {}),
      ...(browserId ? { browserId } : {}),
      markedFinalAt: {
        [require('sequelize').Op.ne]: null
      }
    },
    testPlanReportAttributes: [
      'id',
      'testPlanId',
      'testPlanVersionId',
      'markedFinalAt'
    ],
    testPlanVersionAttributes: ['id', 'phase', 'testPlanId'],
    testPlanRunAttributes: [],
    testPlanAttributes: [],
    atAttributes: [],
    browserAttributes: [],
    userAttributes: [],
    pagination: { order: [['createdAt', 'desc']] },
    transaction
  });

  const filteredReports = testPlanReports.filter(
    report =>
      report.testPlanVersion &&
      ['CANDIDATE', 'RECOMMENDED'].includes(report.testPlanVersion.phase)
  );

  const reportsByTestPlan = {};
  filteredReports.forEach(report => {
    const testPlanId = report.testPlanId;
    const phase = report.testPlanVersion.phase;

    if (!reportsByTestPlan[testPlanId]) {
      reportsByTestPlan[testPlanId] = [];
    }

    const hasRecommended = reportsByTestPlan[testPlanId].some(
      r => r.testPlanVersion.phase === 'RECOMMENDED'
    );

    if (phase === 'RECOMMENDED' || !hasRecommended) {
      reportsByTestPlan[testPlanId].push(report);
    }
  });

  return Object.values(reportsByTestPlan).flat();
};

module.exports = getFilteredTestPlanReports;
