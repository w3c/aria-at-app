const conflictsResolver = require('./conflictsResolver');

const conflictsLengthResolver = async testPlanReport => {
    if (testPlanReport?.metrics?.conflictsCount !== undefined)
        return testPlanReport.metrics.conflictsCount;
    else {
        const conflicts = await conflictsResolver(testPlanReport);
        return conflicts.length;
    }
};

module.exports = conflictsLengthResolver;
