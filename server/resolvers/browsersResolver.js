const { getBrowsers } = require('../models/services/BrowserService');

const browsersResolver = () => {
    return getBrowsers();
};

module.exports = browsersResolver;
