const UsersService = require('../services/usersService');

class UsersController {
    static async addUser(req, res) {
        const user = req.body;
        try {
            const createdUser = await UsersService.addUser(user);
            res.status(201).json(createdUser);
        } catch (error) {
            res.status(400);
        }
    }
    static async addUserToRole(req, res) {
        const userToRole = req.body;
        try {
            const createdUser = await UsersService.addUserToRole(userToRole);
            res.status(201).json(createdUser);
        } catch (error) {
            res.status(400);
        }
    }
}

module.exports = UsersController;
