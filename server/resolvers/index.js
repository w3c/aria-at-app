const me = require('./me');
const userRoles = require('./user-roles');

const resolvers = {
    Query: {
        me
    },
    User: {
        roles: userRoles
    }
};

module.exports = resolvers;
