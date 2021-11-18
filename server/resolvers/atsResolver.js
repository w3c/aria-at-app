const { getAts } = require('../models/services/AtService');

const atsResolver = () => {
    return getAts(undefined, undefined, undefined, undefined, undefined, {
        order: [['name', 'asc']]
    });
};

module.exports = atsResolver;
