const mutateTestResultResolver = (_, { id }) => {
    return { parentContext: { id } };
};

module.exports = mutateTestResultResolver;
