const { AuthenticationError } = require('apollo-server');
const { findOrCreateAtVersion } = require('../../models/services/AtService');

const findOrCreateAtVersionResolver = async (
    { parentContext: { id: atId } },
    { input: { name, releasedAt } },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    return findOrCreateAtVersion({ atId, name, releasedAt });
};

module.exports = findOrCreateAtVersionResolver;
