const { getKeyMetrics } = require('../models/services/TestPlanRunService');

let cachedResult = {};
let cacheTime = 0;
let cacheExpire = 60 * 60 * 1000;

const keyMetricsResolver = async (_, __, context) => {
  // mock out the results in the test environment to make snapshots easier to test
  if (process.env.ENVIRONMENT == 'test') {
    return {
      date: 1758821000000,
      verdictsCount: 12345,
      commandsCount: 1234,
      contributorsCount: 12,
      verdictsLast90Count: 123
    };
  }
  if (cacheTime < Date.now() - cacheExpire) {
    cacheTime = Date.now();
    cachedResult = await getKeyMetrics(context);
  }

  return cachedResult;
};

module.exports = keyMetricsResolver;
