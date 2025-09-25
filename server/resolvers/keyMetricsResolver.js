const { getKeyMetrics } = require('../models/services/TestPlanRunService');

let cachedResult = {};
let cacheTime = 0;
let cacheExpire = 60 * 60 * 1000;

const keyMetricsResolver = async (_, __, context) => {
  if (cacheTime < Date.now() - cacheExpire) {
    cacheTime = Date.now();
    cachedResult = await getKeyMetrics(context);
  }

  return cachedResult;
};

module.exports = keyMetricsResolver;
