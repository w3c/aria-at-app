const mutateTestPlanRunResolver = (_, { id }) => {
    return { parentContext: { id } };
};

module.exports = mutateTestPlanRunResolver;
