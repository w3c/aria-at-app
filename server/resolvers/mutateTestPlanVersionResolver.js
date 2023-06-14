const mutateTestPlanVersionResolver = (_, { id }) => {
    return { parentContext: { id } };
};

module.exports = mutateTestPlanVersionResolver;
