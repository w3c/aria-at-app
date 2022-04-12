const {
    createAtVersion,
    getAtVersionByQuery
} = require('../../models/services/AtService');

const findOrCreateAtVersionResolver = async (
    { parentContext: { id: atId } },
    { atVersion, availability }
) => {
    let version = await getAtVersionByQuery({
        atId,
        atVersion,
        availability
    });

    if (!version) {
        version = await createAtVersion({ atId, atVersion, availability });
    }

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

module.exports = findOrCreateAtVersionResolver;
