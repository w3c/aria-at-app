const { AuthenticationError } = require('apollo-server');
const {
    getBrowserVersionByQuery,
    createBrowserVersion
} = require('../../models/services/BrowserService');

const findOrCreateBrowserVersionResolver = async (
    { parentContext: { id: browserId } },
    { input: { name } },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    let version = await getBrowserVersionByQuery({ browserId, name });

    if (!version) {
        version = await createBrowserVersion({ browserId, name });
    }

    return version;
};

module.exports = findOrCreateBrowserVersionResolver;
