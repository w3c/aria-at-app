const { getAtVersionByQuery } = require('../models/services/AtService');

const atVersionsResolver = async (_, { atId, atVersion }) => {
    return await getAtVersionByQuery({ atId, atVersion });
};

module.exports = atVersionsResolver;
