const { AuthenticationError } = require('apollo-server');
const {
    createAtVersion,
    getAtVersionByQuery
} = require('../../models/services/AtService');

const createAtVersionResolver = async (
    { parentContext: { id: atId } },
    { name, releasedAt },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    let version = await getAtVersionByQuery({ atId, name, releasedAt });

    if (!version) {
        version = await createAtVersion({ atId, name, releasedAt });
    }

    return;
};

module.exports = createAtVersionResolver;
