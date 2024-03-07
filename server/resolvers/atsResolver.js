const atsResolver = async (_, __, context) => {
    const { transaction, atLoader } = context;

    const result = await atLoader.getAll({ transaction });
    return result;
};

module.exports = atsResolver;
