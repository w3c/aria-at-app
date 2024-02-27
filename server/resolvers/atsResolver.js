const AtLoader = require('../models/loaders/AtLoader');

const atsResolver = async (_, __, context) => {
    const { transaction } = context;

    const atLoader = AtLoader();
    return atLoader.getAll({ transaction });
};

module.exports = atsResolver;
