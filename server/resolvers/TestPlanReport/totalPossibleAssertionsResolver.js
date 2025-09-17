const {
  computeTotalPossibleAssertionsForReport
} = require('../../models/services/TestPlanReportService');

// Simple in-memory cache keyed by TestPlanReport id
const cache = new Map();

module.exports = testPlanReport => {
  const reportId = testPlanReport && testPlanReport.id;

  if (reportId != null && cache.has(reportId)) {
    return cache.get(reportId);
  }

  const total = computeTotalPossibleAssertionsForReport(testPlanReport) || 0;

  if (reportId != null) {
    cache.set(reportId, total);
  }

  return total;
};
