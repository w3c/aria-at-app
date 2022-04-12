const { updateAtVersionByQuery } = require('../../models/services/AtService');

const editAtVersionResolver = async (
    { parentContext: { id: atId } },
    { atVersion, availability, updateParams }
) => {
    const version = await updateAtVersionByQuery(
        { atId, atVersion, availability },
        updateParams
    );

    const {
        atId: versionAtId,
        atVersion: versionAtVersion,
        availability: versionAvailability
    } = version;

    return {
        atId: versionAtId,
        atVersion: versionAtVersion,
        availability: versionAvailability
    };
};

module.exports = editAtVersionResolver;
