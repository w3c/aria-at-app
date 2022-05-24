const { AuthenticationError } = require('apollo-server');
const { removeAtVersionById } = require('../../models/services/AtService');

const deleteAtVersionResolver = async (
    { parentContext: { id } },
    _,
    { user }
) => {
    // TODO: update with check and return type
    if (!user?.roles.find(role => role.name === 'ADMIN')) {
        throw new AuthenticationError();
    }

    await removeAtVersionById(id);

    return {
        isDeleted: true,
        failedDueToTestResults: [{ locationOfData: { fake: true } }]
    };
};

module.exports = deleteAtVersionResolver;
