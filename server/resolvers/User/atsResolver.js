const { getAts } = require('../../models/services/AtService');

const atsResolver = () => {
    // TODO: actually link to users
    return getAts();
};

module.exports = atsResolver;
