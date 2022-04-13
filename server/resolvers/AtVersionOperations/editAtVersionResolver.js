const { updateAtVersionByQuery } = require('../../models/services/AtService');
const { AuthenticationError } = require('apollo-server');

const editAtVersionResolver = async (
    { parentContext: { id: atId } },
    { atVersion, updateParams },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    const version = await updateAtVersionByQuery(
        { atId, atVersion },
        updateParams
    );

    return {
        atId: version.atId,
        atVersion: version.atVersion,
        availability: version.availability
    };
};

module.exports = editAtVersionResolver;
