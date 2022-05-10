const { AuthenticationError } = require('apollo-server');
const {
    removeBrowserVersionById
} = require('../../models/services/BrowserService');

const deleteBrowserVersionResolver = async (
    { parentContext: { id } },
    _,
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    return await removeBrowserVersionById(id);
};

module.exports = deleteBrowserVersionResolver;
