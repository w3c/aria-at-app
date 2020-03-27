const { Users, UserToRole } = require('../models/usersModel');

class UsersService {
    static async addUser(user) {
        try {
            const newUser = await Users.create(user);
            return newUser;
        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    }

    static async addUserToRole(userToRole) {
        try {
            const newUserToRole = await UserToRole.create(userToRole);
            return newUserToRole;
        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    }
}

module.exports = UsersService;
