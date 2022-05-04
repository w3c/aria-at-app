const { AuthenticationError } = require('apollo-server');
const {
    updateBrowserVersionById
} = require('../../models/services/BrowserService');

const editBrowserVersionResolver = async (
    { parentContext: { id } },
    { updatedName },
    { user }
) => {
    if (
        !(
            (
                user?.roles.find(role => role.name === 'ADMIN') ||
                user?.roles.find(role => role.name === 'TESTER')
            ) // Tester is allowed to change Browser Version when it cannot be automatically detected
        )
    ) {
        throw new AuthenticationError();
    }

    return await updateBrowserVersionById(id, { name: updatedName });
};

module.exports = editBrowserVersionResolver;
