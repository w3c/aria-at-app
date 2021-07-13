const { getAts } = require('../models/services/AtService');

const atsResolver = () => {
    return getAts();
};

module.exports = atsResolver;
