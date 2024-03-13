const { getUserById } = require('../../models/services/UserService');

const atsResolver = async (_, __, context) => {
    const { user, transaction } = context;

    const { ats } = await getUserById({ id: user.id, transaction });

    return ats;
};

module.exports = atsResolver;
