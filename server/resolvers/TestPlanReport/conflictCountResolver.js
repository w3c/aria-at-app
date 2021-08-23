const conflictsResolver = require('./conflictsResolver');

const conflictCountResolver = testPlanReport => {
    const conflicts = conflictsResolver(testPlanReport);
    return Object.keys(conflicts).reduce(
        (acc, curr) => (conflicts[curr].length ? 1 : 0),
        0
    );
};

module.exports = conflictCountResolver;
