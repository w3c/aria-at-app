const { AuthenticationError } = require('apollo-server');
const {
    findOrCreateBrowserVersion
} = require('../../models/services/BrowserService');

const findOrCreateBrowserVersionResolver = async (
    { parentContext: { id: browserId } },
    { input: { name } },
    context
) => {
    const { user, t } = context;

    if (
        !user?.roles.find(
            role => role.name === 'ADMIN' || role.name === 'TESTER'
        )
    ) {
        throw new AuthenticationError();
    }

    let version = await findOrCreateBrowserVersion({
        where: { browserId, name },
        t
    });

    return version;
};

module.exports = findOrCreateBrowserVersionResolver;
