const mutateAtVersionResolver = (_, { id }) => {
    return { parentContext: { id } };
};

module.exports = mutateAtVersionResolver;
