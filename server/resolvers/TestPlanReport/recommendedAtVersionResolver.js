const { getAtVersionById } = require('../../models/services/AtService');
const {
  getTestPlanVersionById
} = require('../../models/services/TestPlanVersionService');
const earliestAtVersionResolver = require('../TestPlanVersion/earliestAtVersionResolver');

const recommendedAtVersionResolver = async (testPlanReport, _, context) => {
  const { transaction } = context;

  let testPlanVersion;
  if (testPlanReport.testPlanVersion) {
    testPlanVersion = testPlanReport.testPlanVersion;
  } else {
    testPlanVersion = await getTestPlanVersionById({
      id: testPlanReport.testPlanVersionId,
      testPlanVersionAttributes: ['id', 'phase'],
      testPlanReportAttributes: [],
      testPlanRunAttributes: [],
      atAttributes: [],
      browserAttributes: [],
      userAttributes: [],
      transaction
    });
  }
  const phase = testPlanVersion.phase;

  if (!testPlanReport.markedFinalAt || phase !== 'RECOMMENDED') return null;

  // If report was created with exact version being required, display that
  if (testPlanReport.exactAtVersionId) {
    return getAtVersionById({
      id: testPlanReport.exactAtVersionId,
      transaction
    });
  }

  // Otherwise return the earliest At version used to record results
  return earliestAtVersionResolver(
    testPlanVersion,
    { atId: testPlanReport.atId },
    context
  );
};

module.exports = recommendedAtVersionResolver;
