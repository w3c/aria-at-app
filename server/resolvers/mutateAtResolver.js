const mutateAtResolver = (_, { id }) => {
    return { parentContext: { id } };
};

module.exports = mutateAtResolver;
