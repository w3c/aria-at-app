const { AuthenticationError } = require('apollo-server-express');
const { getUsers } = require('../models/services/UserService');

const usersResolver = (_, __, { user }) => {
    if (!user.roles.includes('TESTER')) return new AuthenticationError();
    return getUsers();
};

module.exports = usersResolver;
