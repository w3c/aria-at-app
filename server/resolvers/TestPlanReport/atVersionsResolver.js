const {
  getUniqueAtVersionsForReport
} = require('../../models/services/AtService');

const atVersionsResolver = async (testPlanReport, _, context) => {
  const { transaction } = context;

  const results = await getUniqueAtVersionsForReport(testPlanReport.id, {
    transaction
  });

  return results.map(
    ({
      atVersionId: id,
      atVersionName: name,
      releasedAt,
      supportedByAutomation
    }) => ({
      id,
      name,
      releasedAt,
      supportedByAutomation
    })
  );
};

module.exports = atVersionsResolver;
