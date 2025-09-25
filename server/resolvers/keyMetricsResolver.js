let cachedResult = {};
let cacheTime = 0;
let cacheExpire = 60 * 60 * 1000;

const keyMetricsResolver = async (_, __, context) => {
  if (cacheTime < Date.now() - cacheExpire) {
    const {
      transaction: { sequelize }
    } = context;
    const [[result]] = await sequelize.query(`
SELECT 
    (EXTRACT(EPOCH from NOW()) * 1000)::bigint as date,
    COUNT(assertions->'passed')::int as "verdictsCount",
    COUNT(DISTINCT scenarios->>'scenarioId')::int as "commandsCount",
    COUNT(DISTINCT run."testerUserId")::int as "contributorsCount",
    SUM(CASE WHEN (DATE(results->>'completedAt') >= CURRENT_DATE - INTERVAL '90 days') THEN 1 ELSE 0 END)::int as "verdictsLast90Count"
FROM 
    "TestPlanRun" AS run
    CROSS JOIN LATERAL jsonb_array_elements(run."testResults") AS results
    CROSS JOIN LATERAL jsonb_array_elements(results->'scenarioResults') AS scenarios
    CROSS JOIN LATERAL jsonb_array_elements(scenarios->'assertionResults') AS assertions
    LEFT OUTER JOIN "User" u ON run."testerUserId" = u."id"
WHERE 
    assertions->'passed' IS NOT NULL
    AND assertions->>'passed' <> ''
    AND NOT u."isBot";
    `);
    cacheTime = Date.now();
    // convert the date to a real "number"
    result.date = parseInt(result.date, 10);
    cachedResult = result;
  }

  return cachedResult;
};

module.exports = keyMetricsResolver;
