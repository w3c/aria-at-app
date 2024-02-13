const { getUsers } = require('../models/services.deprecated/UserService');

const usersResolver = () => {
    // No authentication since participation is public!
    return getUsers(null, {}, null, null, null, null, {
        order: [['username', 'ASC']]
    });
};

module.exports = usersResolver;
