const AtLoader = require('../models/loaders/AtLoader');

const atsResolver = async () => {
    const atLoader = AtLoader();
    return atLoader.getAll();
};

module.exports = atsResolver;
