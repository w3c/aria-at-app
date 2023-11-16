const atsResolver = async (_, __, context) => {
    return context.atLoader.getAll({ transaction: context.transaction });
};

module.exports = atsResolver;
