const {
  getUniqueAtVersionsForReport
} = require('../../models/services/AtVersionService');

const atVersionsResolver = async (testPlanReport, _, context) => {
  const { transaction } = context;

  const results = await getUniqueAtVersionsForReport(testPlanReport.id, {
    transaction
  });

  return results.map(
    ({ atVersionId: id, atVersionName: name, releasedAt }) => ({
      id,
      name,
      releasedAt
    })
  );
};

module.exports = atVersionsResolver;
