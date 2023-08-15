const browsersResolver = async (_, __, context) => {
    return context.browserLoader.getAll();
};

module.exports = browsersResolver;
