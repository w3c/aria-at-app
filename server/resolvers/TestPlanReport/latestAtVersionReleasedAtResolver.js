const {
  getUniqueAtVersionsForReport
} = require('../../models/services/AtVersionService');

const latestAtVersionReleasedAtResolver = async (
  testPlanReport,
  _,
  context
) => {
  const { transaction } = context;

  // Return first element because result should already be sorted by descending
  // order of releasedAt date for AtVersion
  const results = await getUniqueAtVersionsForReport(testPlanReport.id, {
    transaction
  });
  if (results[0]) {
    const { atVersionId: id, atVersionName: name, releasedAt } = results[0];

    return {
      id,
      name,
      releasedAt
    };
  }

  // When TestPlanReport is DRAFT and an assigned tester hasn't set a
  // TestPlanVersion
  return null;
};

module.exports = latestAtVersionReleasedAtResolver;
