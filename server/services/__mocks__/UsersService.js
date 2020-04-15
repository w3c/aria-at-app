const create = require('../../tests/util/create');

const UsersService = {
    addUser: create,
    addUserToRole: create,
    signupUser(options) {
        const { name: fullname, email, username } = options.user;
        return { fullname, email, username };
    },
    getUser(options) {
        return options;
    }
};

module.exports = UsersService;
