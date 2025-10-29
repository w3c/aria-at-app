const { At, Browser } = require('../models');
const populateData = require('../services/PopulatedData/populateData');
const {
  getFinalizedTestResults
} = require('../models/services/TestResultReadService');
const getFilteredTestPlanReports = require('../services/getFilteredTestPlanReports');
const extractFeatureAssertionRows = require('../services/extractFeatureAssertionRows');
const calculateAssertionStatistics = require('../util/calculateAssertionStatistics');

const ariaHtmlFeatureDetailReportResolver = async (
  _,
  { refId, atId, browserId },
  context
) => {
  const { transaction } = context;

  const at = await At.findByPk(atId, { transaction });
  const browser = await Browser.findByPk(browserId, { transaction });

  if (!at || !browser) {
    throw new Error('AT or Browser not found');
  }

  const reportsToProcess = await getFilteredTestPlanReports(
    { atId, browserId },
    { transaction }
  );

  const rows = [];
  let featureInfo = {};

  for (const report of reportsToProcess) {
    try {
      const { testPlanReport: populatedTestPlanReport } = await populateData(
        { testPlanReportId: report.id },
        { context }
      );

      const finalizedTestResults = await getFinalizedTestResults({
        testPlanReport: populatedTestPlanReport,
        context
      });

      if (!finalizedTestResults) continue;

      const testIdToResultIdMap = {};
      if (populatedTestPlanReport.testPlanRuns.length) {
        const primaryTestPlanRun =
          populatedTestPlanReport.testPlanRuns.find(
            ({ isPrimary }) => isPrimary
          ) ||
          populatedTestPlanReport.testPlanRuns.find(testPlanRun =>
            testPlanRun.testResults?.some(
              testResult => !!testResult.completedAt
            )
          ) ||
          populatedTestPlanReport.testPlanRuns[0];

        if (primaryTestPlanRun && primaryTestPlanRun.testResults) {
          primaryTestPlanRun.testResults.forEach(testResult => {
            if (testResult.testId) {
              testIdToResultIdMap[testResult.testId] = testResult.id;
            }
          });
        }
      }

      const { rows: extractedRows, featureInfo: extracted } =
        extractFeatureAssertionRows(
          populatedTestPlanReport,
          report.id,
          finalizedTestResults,
          refId,
          testIdToResultIdMap
        );

      rows.push(...extractedRows);

      if (!featureInfo.refId && extracted.refId) {
        featureInfo = extracted;
      }
    } catch (error) {
      console.error(`error.process.feature.detail.report:${report.id}`, error);
    }
  }

  if (rows.length === 0)
    return {
      feature: {},
      at: {},
      browser: {},
      assertionStatistics: [],
      rows: []
    };

  rows.sort((a, b) => {
    const aTestPlan = `${a.testPlanName}`.toUpperCase();
    const bTestPlan = `${b.testPlanName}`.toUpperCase();
    const testPlanCompare = aTestPlan.localeCompare(bTestPlan);
    if (testPlanCompare !== 0) return testPlanCompare;

    const aTitle = `${a.testTitle}`.toUpperCase();
    const bTitle = `${b.testTitle}`.toUpperCase();
    const titleCompare = aTitle.localeCompare(bTitle);
    if (titleCompare !== 0) return titleCompare;

    const aCommand = `${a.commandSequence}`.toUpperCase();
    const bCommand = `${b.commandSequence}`.toUpperCase();

    return String(aCommand).localeCompare(bCommand);
  });

  return {
    feature: {
      refId: featureInfo.refId,
      type: featureInfo.type,
      linkText: featureInfo.linkText,
      value: featureInfo.value,
      total: rows.length,
      passed: rows.filter(r => r.result === 'Passed').length,
      failed: rows.filter(r => r.result === 'Failed').length,
      untestable: rows.filter(r => r.result === 'Untestable').length,
      passedPercentage:
        rows.length === 0
          ? 0
          : Math.floor(
              (rows.filter(r => r.result === 'Passed').length / rows.length) *
                100
            ),
      formatted:
        rows.length === 0
          ? '0% of passing'
          : `${Math.floor(
              (rows.filter(r => r.result === 'Passed').length / rows.length) *
                100
            )}% of passing`
    },
    at: {
      id: at.id,
      name: at.name,
      key: at.key
    },
    browser: {
      id: browser.id,
      name: browser.name,
      key: browser.key
    },
    assertionStatistics: calculateAssertionStatistics(rows),
    rows: rows.map(row => ({
      testPlanName: row.testPlanName,
      testPlanVersion: row.testPlanVersion,
      testPlanVersionId: row.testPlanVersionId,
      testPlanReportId: row.testPlanReportId,
      testTitle: row.testTitle,
      testId: row.testId,
      testResultId: row.testResultId,
      commandSequence: row.commandSequence,
      assertionPriority: row.assertionPriority,
      assertionPhrase: row.assertionPhrase,
      result: row.result,
      testedOn: row.testedOn,
      atVersion: row.atVersion,
      browserVersion: row.browserVersion,
      severeSideEffectsCount: row.severeSideEffectsCount,
      moderateSideEffectsCount: row.moderateSideEffectsCount
    }))
  };
};

module.exports = ariaHtmlFeatureDetailReportResolver;
