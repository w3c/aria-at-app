const { AuthenticationError } = require('apollo-server');
const editAtVersionResolver = async (
    { parentContext: { id } },
    { updatedName },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }
};

module.exports = editAtVersionResolver;
