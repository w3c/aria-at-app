const { getUserById } = require('../../models/services/UserService');

const atsResolver = async (_, __, context) => {
    const { user, t } = context;

    const { ats } = await getUserById({ id: user.id, t });

    return ats;
};

module.exports = atsResolver;
