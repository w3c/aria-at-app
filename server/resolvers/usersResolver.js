const { getUsers } = require('../models/services/UserService');
const ALLOW_FAKE_ROLE = process.env.ALLOW_FAKE_ROLE === 'true';

const usersResolver = async (_, __, context) => {
    // No authentication since participation is public!

    if (ALLOW_FAKE_ROLE) {
        const me = context.user;
        const users = await getUsers();
        const index = users.findIndex(user => user.id == me.id);
        users[index] = me;

        return users;
    }
    return getUsers();
};

module.exports = usersResolver;
