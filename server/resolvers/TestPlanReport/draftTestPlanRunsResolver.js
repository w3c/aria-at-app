const draftTestPlanRunsResolver = parent => {
    return parent.testPlanRuns.map(raw => {
        return raw.dataValues;
    });
};

module.exports = draftTestPlanRunsResolver;
