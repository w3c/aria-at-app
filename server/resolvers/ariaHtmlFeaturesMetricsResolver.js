const {
  getTestPlanReports
} = require('../models/services/TestPlanReportService');
const getMetrics = require('../../shared/getMetrics');
const finalizedTestResultsResolver = require('./TestPlanReport/finalizedTestResultsResolver');
const runnableTestsResolver = require('./TestPlanReport/runnableTestsResolver');
const populateData = require('../services/PopulatedData/populateData');

/**
 * Runs getMetrics across all test plan reports for test plan versions in
 * candidate and recommended phases. If a test plan has versions in both
 * phases, recommended is preferred.
 */
const getAriaHtmlFeatures = async context => {
  const { transaction } = context;

  // Get all test plan reports for versions in candidate and recommended phases
  const testPlanReports = await getTestPlanReports({
    where: {
      markedFinalAt: {
        [require('sequelize').Op.ne]: null
      }
    },
    testPlanReportAttributes: ['id', 'testPlanId', 'testPlanVersionId'],
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

  // Group by test plan ID and prioritize recommended over candidate
  const reportsByTestPlan = {};
  filteredReports.forEach(report => {
    const testPlanId = report.testPlanId;
    const phase = report.testPlanVersion.phase;

    if (!reportsByTestPlan[testPlanId]) {
      reportsByTestPlan[testPlanId] = [];
    }

    // If we already have a recommended version, skip candidate versions
    const hasRecommended = reportsByTestPlan[testPlanId].some(
      r => r.testPlanVersion.phase === 'RECOMMENDED'
    );

    if (phase === 'RECOMMENDED' || !hasRecommended) {
      reportsByTestPlan[testPlanId].push(report);
    }
  });

  const aggregatedMetrics = {
    ariaFeaturesPassedCount: 0,
    ariaFeaturesCount: 0,
    ariaFeaturesFailedCount: 0,
    ariaFeaturesUntestableCount: 0,
    htmlFeaturesPassedCount: 0,
    htmlFeaturesCount: 0,
    htmlFeaturesFailedCount: 0,
    htmlFeaturesUntestableCount: 0,
    ariaFeatures: [],
    htmlFeatures: []
  };

  // Maps to aggregate per-feature counts by refId + type combination
  const ariaFeaturesMap = new Map();
  const htmlFeaturesMap = new Map();

  // Maps to aggregate per-feature counts by AT + Browser combination
  const ariaFeaturesByAtBrowserMap = new Map();
  const htmlFeaturesByAtBrowserMap = new Map();

  // Process each report
  const reportsToProcess = Object.values(reportsByTestPlan).flat();
  for (const report of reportsToProcess) {
    try {
      const { testPlanReport: populatedTestPlanReport } = await populateData(
        { testPlanReportId: report.id },
        { context }
      );
      const finalizedTestResults = await finalizedTestResultsResolver(
        populatedTestPlanReport,
        null,
        context
      );
      const runnableTests = runnableTestsResolver(
        populatedTestPlanReport,
        null,
        context
      );
      const structuredTestPlanReport = {
        ...populatedTestPlanReport,
        finalizedTestResults,
        runnableTests
      };
      const metrics = getMetrics({ testPlanReport: structuredTestPlanReport });

      // Aggregate numeric metrics
      Object.keys(aggregatedMetrics).forEach(key => {
        if (typeof aggregatedMetrics[key] === 'number') {
          aggregatedMetrics[key] += metrics[key] || 0;
        }
      });

      const atId = populatedTestPlanReport.at.id;
      const browserId = populatedTestPlanReport.browser.id;
      const atName = populatedTestPlanReport.at.name;
      const browserName = populatedTestPlanReport.browser.name;
      const atBrowserKey = `${atId}-${browserId}`;

      const aggregateFeatures = (
        features,
        featuresMap,
        featuresAtBrowserMap
      ) => {
        if (!features) return;

        features.forEach(feature => {
          const featureKey = `${feature.refId}-${feature.type}`;

          // Features aggregation
          if (featuresMap.has(featureKey)) {
            const existing = featuresMap.get(featureKey);
            existing.total += feature.total;
            existing.passed += feature.passed;
            existing.failed += feature.failed;
            existing.untestable += feature.untestable;
            existing.passedPercentage =
              existing.total === 0
                ? 0
                : Math.floor((existing.passed / existing.total) * 100);
            existing.formatted =
              existing.total === 0
                ? '0% of passing'
                : `${existing.passedPercentage}% of passing`;
          } else {
            featuresMap.set(featureKey, feature);
          }

          // AT + Browser aggregation
          const atBrowserFeatureKey = `${atBrowserKey}-${featureKey}`;
          if (featuresAtBrowserMap.has(atBrowserFeatureKey)) {
            const existing = featuresAtBrowserMap.get(atBrowserFeatureKey);
            existing.total += feature.total;
            existing.passed += feature.passed;
            existing.failed += feature.failed;
            existing.untestable += feature.untestable;
            existing.passedPercentage =
              existing.total === 0
                ? 0
                : Math.floor((existing.passed / existing.total) * 100);
            existing.formatted =
              existing.total === 0
                ? '0% of passing'
                : `${existing.passedPercentage}% of passing`;
          } else {
            featuresAtBrowserMap.set(atBrowserFeatureKey, {
              ...feature,
              atName,
              browserName
            });
          }
        });
      };

      aggregateFeatures(
        metrics.ariaFeatures,
        ariaFeaturesMap,
        ariaFeaturesByAtBrowserMap
      );
      aggregateFeatures(
        metrics.htmlFeatures,
        htmlFeaturesMap,
        htmlFeaturesByAtBrowserMap
      );
    } catch (error) {
      console.error(`error.process.aggregate.metrics:${report.id}`, error);
    }
  }

  // Convert aggregated feature maps back to arrays
  aggregatedMetrics.ariaFeatures = Array.from(ariaFeaturesMap.values());
  aggregatedMetrics.htmlFeatures = Array.from(htmlFeaturesMap.values());

  // Add AT + Browser aggregated features
  aggregatedMetrics.ariaFeaturesByAtBrowser = Array.from(
    ariaFeaturesByAtBrowserMap.values()
  );
  aggregatedMetrics.htmlFeaturesByAtBrowser = Array.from(
    htmlFeaturesByAtBrowserMap.values()
  );

  return aggregatedMetrics;
};

const ariaHtmlFeaturesMetricsResolver = async (_, __, context) => {
  return await getAriaHtmlFeatures(context);
};

module.exports = ariaHtmlFeaturesMetricsResolver;
