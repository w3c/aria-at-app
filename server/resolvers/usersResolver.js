const { getUsers } = require('../models/services/UserService');

const usersResolver = (_, __, context) => {
    const { t } = context;

    // No authentication since participation is public!
    return getUsers({
        pagination: { order: [['username', 'ASC']] },
        t
    });
};

module.exports = usersResolver;
