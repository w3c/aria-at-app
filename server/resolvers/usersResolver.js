const { getUsers } = require('../models/services/UserService');

const usersResolver = (_, __, context) => {
    const { transaction } = context;

    // No authentication since participation is public!
    return getUsers({
        pagination: { order: [['username', 'ASC']] },
        transaction
    });
};

module.exports = usersResolver;
