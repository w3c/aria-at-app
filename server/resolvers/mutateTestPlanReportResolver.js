const mutateTestPlanReportResolver = (_, { id, ids }) => {
    return { parentContext: { id, ids } };
};

module.exports = mutateTestPlanReportResolver;
