const mutateBrowserVersionResolver = (_, { id }) => {
    return { parentContext: { id } };
};

module.exports = mutateBrowserVersionResolver;
