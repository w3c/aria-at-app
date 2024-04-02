const browsersResolver = async (_, __, context) => {
    const { transaction, browserLoader } = context;

    return browserLoader.getAll({ transaction });
};

module.exports = browsersResolver;
