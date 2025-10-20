const { At, Browser } = require('../models');
const populateData = require('../services/PopulatedData/populateData');
const {
  getFinalizedTestResults
} = require('../models/services/TestResultReadService');
const getFilteredTestPlanReports = require('../services/getFilteredTestPlanReports');
const extractFeatureAssertionRows = require('../services/extractFeatureAssertionRows');

const calculateAssertionStatistics = rows => {
  const statistics = {
    must: {
      total: 0,
      passed: 0,
      failed: 0,
      untestable: 0
    },
    should: {
      total: 0,
      passed: 0,
      failed: 0,
      untestable: 0
    }
  };

  rows.forEach(row => {
    const priority = row.assertionPriority === 'Must' ? 'must' : 'should';
    statistics[priority].total++;

    if (row.result === 'Passed') {
      statistics[priority].passed++;
    } else if (row.result === 'Failed') {
      statistics[priority].failed++;
    } else if (row.result === 'Untestable') {
      statistics[priority].untestable++;
    }
  });

  const mustTotal = statistics.must.total;
  const shouldTotal = statistics.should.total;
  const combinedTotal = mustTotal + shouldTotal;

  const combinedPassed = statistics.must.passed + statistics.should.passed;
  const combinedFailed = statistics.must.failed + statistics.should.failed;
  const combinedUntestable =
    statistics.must.untestable + statistics.should.untestable;

  const calculatePercentage = (count, total) =>
    total === 0 ? null : Math.floor((count / total) * 100);

  return [
    {
      label: 'Must-Have Behaviors',
      passingCount: statistics.must.passed,
      passingTotal: mustTotal,
      failingCount: statistics.must.failed,
      failingTotal: mustTotal,
      untestableCount: statistics.must.untestable,
      untestableTotal: mustTotal,
      passingPercentage: calculatePercentage(statistics.must.passed, mustTotal),
      failingPercentage: calculatePercentage(statistics.must.failed, mustTotal),
      untestablePercentage: calculatePercentage(
        statistics.must.untestable,
        mustTotal
      )
    },
    {
      label: 'Should-Have Behaviors',
      passingCount: statistics.should.passed,
      passingTotal: shouldTotal,
      failingCount: statistics.should.failed,
      failingTotal: shouldTotal,
      untestableCount: statistics.should.untestable,
      untestableTotal: shouldTotal,
      passingPercentage: calculatePercentage(
        statistics.should.passed,
        shouldTotal
      ),
      failingPercentage: calculatePercentage(
        statistics.should.failed,
        shouldTotal
      ),
      untestablePercentage: calculatePercentage(
        statistics.should.untestable,
        shouldTotal
      )
    },
    {
      label: 'Must + Should',
      passingCount: combinedPassed,
      passingTotal: combinedTotal,
      failingCount: combinedFailed,
      failingTotal: combinedTotal,
      untestableCount: combinedUntestable,
      untestableTotal: combinedTotal,
      passingPercentage: calculatePercentage(combinedPassed, combinedTotal),
      failingPercentage: calculatePercentage(combinedFailed, combinedTotal),
      untestablePercentage: calculatePercentage(
        combinedUntestable,
        combinedTotal
      )
    },
    {
      label: 'Percent of Behaviors',
      passingCount: calculatePercentage(combinedPassed, combinedTotal),
      passingTotal: 100,
      failingCount: calculatePercentage(combinedFailed, combinedTotal),
      failingTotal: 100,
      untestableCount: calculatePercentage(combinedUntestable, combinedTotal),
      untestableTotal: 100,
      passingPercentage: calculatePercentage(combinedPassed, combinedTotal),
      failingPercentage: calculatePercentage(combinedFailed, combinedTotal),
      untestablePercentage: calculatePercentage(
        combinedUntestable,
        combinedTotal
      )
    }
  ];
};

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

      const finalizedTestResults = await getFinalizedTestResults(
        populatedTestPlanReport,
        context
      );

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
    throw new Error(
      `No data found for refId: ${refId}, atId: ${atId}, browserId: ${browserId}`
    );
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
      testPlanReportId: row.testPlanReportId,
      testTitle: row.testTitle,
      testId: row.testId,
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
