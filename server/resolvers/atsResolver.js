const atsResolver = async (_, __, context) => {
    return context.atLoader.getAll();
};

module.exports = atsResolver;
