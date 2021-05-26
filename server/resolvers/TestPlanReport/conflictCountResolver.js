const conflictCountResolver = (parent) => {
    if (parent.testPlanRuns.length <= 1) return 0;
    throw new Error('Not fully implemented');
};

module.exports = conflictCountResolver;
