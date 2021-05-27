const conflictsResolver = require('./conflictsResolver');

const conflictCountResolver = testPlanReport => {
    const conflicts = conflictsResolver(testPlanReport);
    return conflicts.length;
};

module.exports = conflictCountResolver;
