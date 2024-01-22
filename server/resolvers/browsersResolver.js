const BrowserLoader = require('../models/loaders/BrowserLoader');

const browsersResolver = async () => {
    const browserLoader = BrowserLoader();
    return browserLoader.getAll();
};

module.exports = browsersResolver;
