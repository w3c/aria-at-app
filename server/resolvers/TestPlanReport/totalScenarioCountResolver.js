const { sequelize } = require('../../models');

const totalScenarioCountResolver = async testPlanReport => {
  try {
    if (!testPlanReport?.testPlanVersionId || !testPlanReport?.atId) {
      return 0;
    }

    const result = await sequelize.query(
      `
      SELECT COUNT(*) as count
      FROM "TestPlanVersion",
           jsonb_array_elements("tests") test,
           jsonb_array_elements(test->'scenarios') scenario
      WHERE "TestPlanVersion".id = $1
        AND test->'atIds' @> to_jsonb($2::int)
        AND (scenario->>'atId')::int = $2
      `,
      {
        bind: [testPlanReport.testPlanVersionId, testPlanReport.atId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return parseInt(result?.[0]?.count || 0, 10);
  } catch (error) {
    return 0;
  }
};

module.exports = totalScenarioCountResolver;
