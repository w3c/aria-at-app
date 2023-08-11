const browserResolver = async (_, __, context) => {
    return context.browserLoader.getAll();
};

module.exports = browserResolver;
