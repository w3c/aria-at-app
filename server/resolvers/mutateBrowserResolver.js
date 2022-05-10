const mutateBrowserResolver = (_, { id }) => {
    return { parentContext: { id } };
};

module.exports = mutateBrowserResolver;
