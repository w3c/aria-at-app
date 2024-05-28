const { getUserById } = require('../../models/services/UserService');

const atsResolver = async (user, __, context) => {
    const { transaction } = context;

    if (user.ats) return user.ats;

    const { ats } = await getUserById({ id: user.id, transaction });

    return ats;
};

module.exports = atsResolver;
