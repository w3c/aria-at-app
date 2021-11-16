const { getUsers } = require('../models/services/UserService');

const usersResolver = () => {
    // No authentication since participation is public!
    return getUsers();
};

module.exports = usersResolver;
