const { getAts, getAtVersionById } = require('../../models/services/AtService');
const {
  getTestPlanReports
} = require('../../models/services/TestPlanReportService');

const earliestAtVersionResolver = async (
  testPlanVersion,
  { atId },
  context
) => {
  const { transaction } = context;

  let reports = [];
  if (testPlanVersion.testPlanReports) {
    reports = [...testPlanVersion.testPlanReports];
  } else {
    reports = await getTestPlanReports({
      where: { testPlanVersionId: testPlanVersion.id },
      transaction
    });
  }

  if (!reports.length || testPlanVersion.phase !== 'RECOMMENDED') {
    return null;
  }

  // To track the required reports for RECOMMENDED phase
  const ats = await getAts({ transaction });

  let earliestAtVersion = null;
  for (const testPlanReport of reports.filter(
    testPlanReport =>
      testPlanReport.atId == atId && testPlanReport.markedFinalAt
  )) {
    const browserId = testPlanReport.browserId;

    // Need to check if is required report for a primary test plan run
    const isRequiredReport = ats
      .find(at => at.id == atId)
      .browsers.find(browser => browser.id == browserId)
      .AtBrowsers.isRecommended;

    if (isRequiredReport) {
      const primaryRun =
        testPlanReport.testPlanRuns.find(({ isPrimary }) => isPrimary) ||
        testPlanReport.testPlanRuns[0];
      const primaryRunAtVersionId = primaryRun.testResults[0].atVersionId;
      const atVersion = await getAtVersionById({
        id: primaryRunAtVersionId,
        transaction
      });

      if (
        !earliestAtVersion ||
        new Date(atVersion.releasedAt) < new Date(earliestAtVersion.releasedAt)
      ) {
        earliestAtVersion = {
          id: atVersion.id,
          name: atVersion.name,
          releasedAt: atVersion.releasedAt
        };
      }
    }
  }

  return earliestAtVersion;
};

module.exports = earliestAtVersionResolver;
