const { AuthenticationError } = require('apollo-server-express');
const {
    bulkGetOrReplaceUserAts
} = require('../models/services.deprecated/UserService');

const updateMeResolver = async (_, { input: { atIds } }, context) => {
    const { user, transaction } = context;

    if (!user) {
        throw new AuthenticationError();
    }

    await bulkGetOrReplaceUserAts({
        where: { userId: user.id },
        valuesList: atIds.map(atId => ({ atId })),
        transaction
    });

    return user;
};

module.exports = updateMeResolver;
