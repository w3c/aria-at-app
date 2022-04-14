const { AuthenticationError } = require('apollo-server');
const { removeAtVersionByQuery } = require('../../models/services/AtService');

const deleteAtVersionResolver = async (
    { parentContext: { id: atId } },
    { atVersion },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    await removeAtVersionByQuery({ atId, atVersion });
};

module.exports = deleteAtVersionResolver;
