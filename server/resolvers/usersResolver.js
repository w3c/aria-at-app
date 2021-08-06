const { getUsers } = require('../models/services/UserService');

const usersResolver = () => {
    return getUsers();
};

module.exports = usersResolver;
