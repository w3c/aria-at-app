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

      const { rows: extractedRows, featureInfo: extracted } =
        extractFeatureAssertionRows(
          populatedTestPlanReport,
          report.id,
          finalizedTestResults,
          refId
        );

      rows.push(...extractedRows);

      if (!featureInfo.refId && extracted.refId) {
        featureInfo = extracted;
      }
    } catch (error) {
      console.error(`error.process.feature.detail.report:${report.id}`, error);
    }
  }

  if (rows.length === 0) {
    return {
      feature: {
        refId,
        type: '',
        linkText: '',
        value: '',
        total: 0,
        passed: 0,
        failed: 0,
        untestable: 0,
        passedPercentage: 0,
        formatted: '0% of passing'
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
      assertionStatistics: calculateAssertionStatistics([]),
      rows: []
    };
  }

  rows.sort((a, b) => {
    const aTestPlan = a.testPlanName ?? '';
    const bTestPlan = b.testPlanName ?? '';
    if (String(aTestPlan) !== String(bTestPlan))
      return String(aTestPlan).localeCompare(bTestPlan);

    const aTestTitle = a.testTitle ?? '';
    const bTestTitle = b.testTitle ?? '';
    if (String(aTestTitle) !== String(bTestTitle))
      return String(aTestTitle).localeCompare(bTestTitle);

    const aCommand = a.commandSequence ?? '';
    const bCommand = b.commandSequence ?? '';
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
