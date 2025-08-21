const {
  getTestPlanReportById
} = require('../../models/services/TestPlanReportService');

const isRerunResolver = async (
  testPlanReport,
  args, // eslint-disable-line no-unused-vars
  context // eslint-disable-line no-unused-vars
) => {
  // Simple per-request memoization
  if (context) {
    if (!context._isRerunCache) context._isRerunCache = new Map();
    const cached = context._isRerunCache.get(testPlanReport.id);
    if (typeof cached === 'boolean') return cached;
  }
  const hasMatchInRuns = report =>
    Array.isArray(report.testPlanRuns) &&
    report.testPlanRuns.some(
      run =>
        Array.isArray(run.testResults) &&
        run.testResults.some(
          tr =>
            Array.isArray(tr.scenarioResults) &&
            tr.scenarioResults.some(sr => sr?.match && sr.match?.type)
        )
    );

  // If testPlanRuns with nested results were already populated, use them
  if (hasMatchInRuns(testPlanReport)) {
    if (context && context._isRerunCache)
      context._isRerunCache.set(testPlanReport.id, true);
    return true;
  }

  // Otherwise, load with nested results to check for matches
  const { transaction } = context || {};
  const loaded = await getTestPlanReportById({
    id: testPlanReport.id,
    transaction
  });
  const result = hasMatchInRuns(loaded);
  if (context && context._isRerunCache)
    context._isRerunCache.set(testPlanReport.id, result);
  return result;
};

module.exports = isRerunResolver;
