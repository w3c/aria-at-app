const conflictsResolver = require('./conflictsResolver');

const conflictsLengthResolver = async (testPlanReport, _, context) => {
  if (testPlanReport?.metrics?.conflictsCount !== undefined) {
    return testPlanReport.metrics.conflictsCount;
  } else {
    const conflicts = await conflictsResolver(testPlanReport, null, context);
    return conflicts.length;
  }
};

module.exports = conflictsLengthResolver;
