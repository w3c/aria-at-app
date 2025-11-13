const {
  getTestPlanReports
} = require('../models/services/TestPlanReportService');

/**
 * Retrieves and filters test plan reports that are finalized and in CANDIDATE or
 * RECOMMENDED phases. For each test plan, prioritizes RECOMMENDED phase reports
 * over CANDIDATE phase reports. If a RECOMMENDED report exists for a test plan,
 * only RECOMMENDED reports are included; otherwise, CANDIDATE reports are included.
 *
 * @param {Object} [filters={}] - Optional filters to apply to the query
 * @param {number} [filters.atId] - Optional AT ID to filter reports by
 * @param {number} [filters.browserId] - Optional browser ID to filter reports by
 * @param {Object} options - Options object
 * @param {Object} options.transaction - Sequelize transaction for database operations
 * @returns {Promise<Array<Object>>} Promise that resolves to an array of filtered
 *   test plan reports
 */
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
