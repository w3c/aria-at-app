const UsersService = require('../services/UsersService');

module.exports = {
    async addUser(req, res) {
        const user = req.body;
        try {
            const createdUser = await UsersService.addUser(user);
            res.status(201).json(createdUser);
        } catch (error) {
            res.status(400);
            res.end();
        }
    },
    async addUserToRole(req, res) {
        const userToRole = req.body;
        try {
            const createdUser = await UsersService.addUserToRole(userToRole);
            res.status(201).json(createdUser);
        } catch (error) {
            res.status(400);
            res.end();
        }
    },
    static async assignUsersToRun(req, res) {
        // What shape of info do I want here? The actual db entry?
        const data = req.body;
        try {
            const usersForRun = await UsersService.assignUsersToRun(data);
            res.status(201).json(usersForRun);
        } catch (error) {
            res.status(400);
        }
    },
    static async removeUsersFromRun(req, res) {
        const user = req.body;
        try {
            console.log("helllo");
            const usersForRun = await UsersService.removeUsersFromRun(user);
            res.status(201).json(usersForRun);
        } catch (error) {
            res.status(400);
        }
    },
    static async getAllTesters(req, res) {
        try {
            const testers = await UsersService.getAllTesters();
            res.status(201).json(testers);
        } catch (error) {
            res.status(400);
        }
    }
};
