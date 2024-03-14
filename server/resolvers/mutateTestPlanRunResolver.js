const mutateTestPlanRunResolver = (
    _,
    { id },
    context // eslint-disable-line no-unused-vars
) => {
    return { parentContext: { id } };
};

module.exports = mutateTestPlanRunResolver;
