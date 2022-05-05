const { getBrowsers } = require('../models/services/BrowserService');

const browsersResolver = () => {
    return getBrowsers(undefined, undefined, undefined, undefined, {
        order: [['name', 'asc']]
    });
};

module.exports = browsersResolver;
