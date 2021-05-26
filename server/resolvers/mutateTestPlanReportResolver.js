const mutateTestPlanReportResolver = (_, { id }) => {
    return { parentContext: { id } };
};

module.exports = mutateTestPlanReportResolver;
