const { AuthenticationError } = require('apollo-server-express');
const { bulkGetOrReplaceUserAts } = require('../models/services/UserService');

const updateMeResolver = async (_, { input: { atIds } }, context) => {
    if (!context.user) {
        throw new AuthenticationError();
    }

    await bulkGetOrReplaceUserAts(
        { userId: context.user.id },
        atIds.map(atId => ({ atId })),
        { comparisonKeys: ['atId'] }
    );

    return context.user;
};

module.exports = updateMeResolver;
