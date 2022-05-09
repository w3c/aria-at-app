const { AuthenticationError } = require('apollo-server');
const {
    updateBrowserVersionById
} = require('../../models/services/BrowserService');

const editBrowserVersionResolver = async (
    { parentContext: { id } },
    { updatedName },
    { user }
) => {
    if (user === null) {
        throw new AuthenticationError();
    }

    return await updateBrowserVersionById(id, { name: updatedName });
};

module.exports = editBrowserVersionResolver;
