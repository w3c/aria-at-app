const { AuthenticationError } = require('apollo-server');
const {
    createAtVersion,
    getAtVersionByQuery
} = require('../../models/services/AtService');

const findOrCreateAtVersionResolver = async (
    { parentContext: { id: atId } },
    { input: { name, releasedAt } },
    { user, transaction }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    let version = await getAtVersionByQuery(
        { atId, name },
        undefined,
        undefined,
        { transaction }
    );

    if (!version) {
        version = await createAtVersion(
            { atId, name, releasedAt },
            undefined,
            undefined,
            { transaction }
        );
    }

    return version;
};

module.exports = findOrCreateAtVersionResolver;
