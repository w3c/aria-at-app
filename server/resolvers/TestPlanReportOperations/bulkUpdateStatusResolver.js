const { AuthenticationError } = require('apollo-server');
const updateStatusResolver = require('./updateStatusResolver');

const bulkUpdateStatusResolver = async (
    { parentContext: { ids } },
    { status },
    { user }
) => {
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    let populateDataResultArray = [];
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const result = await updateStatusResolver(
            { parentContext: { id } },
            { status },
            { user }
        );
        populateDataResultArray.push(result);
    }

    return populateDataResultArray;
};

module.exports = bulkUpdateStatusResolver;
