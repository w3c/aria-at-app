const { AuthenticationError } = require('apollo-server-express');
const { bulkGetOrReplaceUserAts } = require('../models/services/UserService');

const updateMeResolver = async (_, { input: { atIds } }, context) => {
    const { user, t } = context;

    if (!user) {
        throw new AuthenticationError();
    }

    await bulkGetOrReplaceUserAts({
        where: { userId: user.id },
        valuesList: atIds.map(atId => ({ atId })),
        t
    });

    return user;
};

module.exports = updateMeResolver;
