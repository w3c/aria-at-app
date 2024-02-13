const { AuthenticationError } = require('apollo-server');
const {
    updateAtVersionById
} = require('../../models/services.deprecated/AtService');

const updateAtVersionResolver = async (
    { parentContext: { id } },
    { input },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    return await updateAtVersionById(id, input);
};

module.exports = updateAtVersionResolver;
