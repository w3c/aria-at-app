const { AuthenticationError } = require('apollo-server');
const { updateAtVersionById } = require('../../models/services/AtService');
const editAtVersionResolver = async (
    { parentContext: { id } },
    { updatedName },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    return await updateAtVersionById(id, { name: updatedName });
};

module.exports = editAtVersionResolver;
