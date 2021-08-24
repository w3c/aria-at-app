const { getUserById } = require('../../models/services/UserService');

const atsResolver = async (_, __, { user }) => {
    const { ats } = await getUserById(user.id);
    return ats;
};

module.exports = atsResolver;
