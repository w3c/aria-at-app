const create = require('../../tests/util/create');
const users = require('../../tests/mock-data/users.json');

const getUserAndUpdateRoles = jest.fn().mockImplementation(({ user }) => ({
    ...user,
    roles: ['tester', 'admin'],
}));

const UsersService = {
    getUserAndUpdateRoles,
    addUser: create,
    addUserToRole: create,
    signupUser(options) {
        const { name: fullname, email, username } = options.user;
        return { fullname, email, username };
    },
    getUser(options) {
        return options;
    },
    getAllTesters() {
        return [
            {
                ...users[0],
                configured_ats: [{ at_name_id: 1 }],
            },
        ];
    },
};

module.exports = UsersService;
