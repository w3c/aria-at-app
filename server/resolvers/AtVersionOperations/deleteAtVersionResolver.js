const { AuthenticationError } = require('apollo-server');
const { removeAtVersionById } = require('../../models/services/AtService');

const deleteAtVersionResolver = async (
    { parentContext: { id } },
    _,
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    return await removeAtVersionById(id);
};

module.exports = deleteAtVersionResolver;
