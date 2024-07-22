const {
  getUniqueAtVersionsForReport
} = require('../../models/services/AtService');

const atVersionsResolver = async (testPlanReport, _, context) => {
  const { transaction } = context;

  const results = await getUniqueAtVersionsForReport(testPlanReport.id, {
    transaction
  });

  return results.map(({ atVersionId, name, releasedAt }) => ({
    id: atVersionId,
    name,
    releasedAt
  }));
};

module.exports = atVersionsResolver;
