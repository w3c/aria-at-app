const { AuthenticationError } = require('apollo-server');
const {
    createAtVersion,
    getAtVersionByQuery
} = require('../../models/services/AtService');

const findOrCreateAtVersionResolver = async (
    { parentContext: { id: atId } },
    { atVersion, availability },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    let version = await getAtVersionByQuery({
        atId,
        atVersion,
        availability
    });

    if (!version) {
        version = await createAtVersion({ atId, atVersion, availability });
    }

    return {
        atId: version.atId,
        atVersion: version.atVersion,
        availability: version.availability
    };
};

module.exports = findOrCreateAtVersionResolver;
