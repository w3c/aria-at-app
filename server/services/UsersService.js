const { Users, UserToRole } = require('../models/UsersModel');

module.exports = {
    async addUser(user) {
        try {
            const newUser = await Users.create(user);
            return newUser;
        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    },

    async addUserToRole(userToRole) {
        try {
            const newUserToRole = await UserToRole.create(userToRole);
            return newUserToRole;
        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    }
};
