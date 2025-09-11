const {
  computeTotalPossibleAssertionsForReport
} = require('../../models/services/TestPlanReportService');

module.exports = testPlanReport => {
  return computeTotalPossibleAssertionsForReport(testPlanReport) || 0;
};
